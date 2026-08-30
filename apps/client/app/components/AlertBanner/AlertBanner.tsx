import { Icon } from "@components/Icon/Icon";
import { Button } from "@components/Button/Button";
import { formatIncidentId, type Incident } from "../../data/incidents";
import styles from "./AlertBanner.module.css";

interface AlertBannerProps {
  incident: Incident;
}

export function AlertBanner({ incident }: AlertBannerProps) {
  return (
    <div className={styles.banner} role="alert">
      <Icon name="alert" size={40} className={styles.icon} />
      <div className={styles.body}>
        <div className={styles.kicker}>
          <span className={styles.label}>New high-priority incident</span>
          <span className={styles.id}>{formatIncidentId(incident.id)}</span>
        </div>
        <p className={styles.headline}>{incident.summary}</p>
        <p className={styles.location}>{incident.location}</p>
      </div>
      <div className={styles.actions}>
        <Button to={`/incidents/${incident.id}`} variant="danger" size="lg">
          Review incident
        </Button>
      </div>
    </div>
  );
}
