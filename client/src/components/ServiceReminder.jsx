import { Component } from "react";
import { todayLocal } from "../utils.js";

export default class ServiceReminder extends Component {
  constructor(props) {
    super(props);
    this.state = { today: todayLocal() };
    this.timerId = null;
  }

  componentDidMount() {
    this.timerId = setInterval(() => {
      this.setState({ today: todayLocal() });
    }, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  daysSince(isoDate) {
    const [y1, m1, d1] = isoDate.split("-").map(Number);
    const [y2, m2, d2] = this.state.today.split("-").map(Number);
    const ms = new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
    return Math.round(ms / 86400000);
  }

  render() {
    const { logs, threshold } = this.props;
    const lastService = logs
      .filter((l) => l.category === "Service")
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    if (!lastService) {
      return <div className="reminder reminder-warn">No service logged yet. Add your first service entry.</div>;
    }

    const days = this.daysSince(lastService.date);
    const overdue = days >= threshold;

    return (
      <div className={overdue ? "reminder reminder-warn" : "reminder reminder-ok"}>
        <strong>{overdue ? "Service due soon" : "Service up to date"}</strong>
        <span>
          Last service: {lastService.title} on {lastService.vehicle}, {days} day{days === 1 ? "" : "s"} ago
          (reminder after {threshold} days)
        </span>
      </div>
    );
  }
}
