import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ShowToast } from '../../utils/Toster';
import axios from 'axios';
import { useTheme } from '../../context/ThemeProvider';
import { themeSetter } from '../../utils/ThemeSetter';

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  margin-left: 2rem;
`;

const Title = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: ${props => props.theme === 'light' ? props.themeSetter.light.primaryText: props.themeSetter.dark.primaryText};
`

const CronText = styled.span`
  background: white;
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
`;

const ChangeButton = styled.button`
  background: #007bff;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-top: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.3rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.3rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.cancel ? '#ccc' : '#28a745'};
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

export default function CronBuilder() {
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("00:00");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [cron, setCron] = useState("0 0 * * *");
  const [humanReadable, setHumanReadable] = useState("Every day at 00:00");
  const [showModal, setShowModal] = useState(false);

  const { theme } = useTheme();

  const token = sessionStorage.getItem('adminToken');

  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  const handleGenerate = async () => {
    const [hour, minute] = time.split(":").map(Number);
    let cronExpr = "";
    let readable = "";
  
    switch (frequency) {
      case "daily":
        cronExpr = `${minute} ${hour} * * *`;
        readable = `Every day at ${formatTime(hour, minute)}`;
        break;
      case "weekly":
        const dow = daysOfWeek.indexOf(dayOfWeek);
        cronExpr = `${minute} ${hour} * * ${dow}`;
        readable = `Every ${dayOfWeek} at ${formatTime(hour, minute)}`;
        break;
      case "monthly":
        cronExpr = `${minute} ${hour} ${dayOfMonth} * *`;
        readable = `Every month on the ${ordinal(dayOfMonth)} at ${formatTime(hour, minute)}`;
        break;
      case "hourly":
        cronExpr = `0 * * * *`;
        readable = `Every hour`;
        break;
      default:
        cronExpr = "";
    }
  
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/cron-config/${taskName}`, {
        schedule: cronExpr,
        enabled: true
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
  
      setCron(cronExpr);
      setHumanReadable(readable);
      setShowModal(false);
  
      ShowToast({
        title: "Success",
        type: "success",
        message: `Updated to: ${cronExpr}`
      });
    } catch (err) {
      ShowToast({
        title: "Error",
        type: "error",
        message: "Failed to update Cron Job"
      });
      console.error("PUT error:", err);
    }
  };  

  const [taskName, setTaskName] = useState("");

  const fetchCron = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/cron-config/all`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      const data = response.data[0];
  
      const cronValue = data?.schedule || "0 0 * * *";
      const name = data?.taskName || "default-task";
      
      setCron(cronValue);
      setTaskName(name);
  
      const [min, hour, dom, , dow] = cronValue.split(" ");
      if (dow !== "*") {
        const day = daysOfWeek[parseInt(dow)];
        setFrequency("weekly");
        setDayOfWeek(day);
        setTime(`${hour.padStart(2, "0")}:${min.padStart(2, "0")}`);
        setHumanReadable(`Every ${day} at ${formatTime(hour, min)}`);
      } else if (dom !== "*") {
        setFrequency("monthly");
        setDayOfMonth(parseInt(dom));
        setTime(`${hour.padStart(2, "0")}:${min.padStart(2, "0")}`);
        setHumanReadable(`Every month on the ${ordinal(parseInt(dom))} at ${formatTime(hour, min)}`);
      } else if (hour !== "*" && min !== "*") {
        setFrequency("daily");
        setTime(`${hour.padStart(2, "0")}:${min.padStart(2, "0")}`);
        setHumanReadable(`Every day at ${formatTime(hour, min)}`);
      } else {
        setFrequency("hourly");
        setHumanReadable("Every hour");
      }
    } catch (error) {
      console.error("Error in fetching cron job:", error);
    }
  };  

  useEffect(() => {
    fetchCron();
  }, []);

  return (
    <>
      <Wrapper>
        <Title theme={theme} themeSetter={themeSetter}>Cron Job Schedule: </Title>
        <CronText>{humanReadable}</CronText>
        <ChangeButton onClick={() => setShowModal(true)}>Change</ChangeButton>
      </Wrapper>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>Set Cron Schedule</h3>

            <Label>Frequency</Label>
            <Select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="hourly">Hourly</option>
            </Select>

            {frequency === "weekly" && (
              <>
                <Label>Day of the Week</Label>
                <Select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </Select>
              </>
            )}

            {frequency === "monthly" && (
              <>
                <Label>Day of the Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Number(e.target.value))}
                />
              </>
            )}

            {frequency !== "hourly" && (
              <>
                <Label>Time (HH:MM)</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </>
            )}

            <ButtonGroup>
              <ActionButton cancel onClick={() => setShowModal(false)}>Cancel</ActionButton>
              <ActionButton onClick={handleGenerate}>Save Changes</ActionButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}
