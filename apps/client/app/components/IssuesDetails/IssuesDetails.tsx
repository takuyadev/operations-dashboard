import { useMemo, useState } from "react";

import { cx } from "@utilities/cx";
import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { Button } from "@components/Button/Button";
import { Avatar } from "@components/Avatar/Avatar";
import { PriorityTag } from "@components/Tag/PriorityTag";
import { StatusTag } from "@components/Tag/StatusTag";
import { TextAreaField } from "@components/Field/Field";
import { ActivityFeed } from "@components/ActivityFeed/ActivityFeed";
import { MediaFrame } from "@components/MediaFrame/MediaFrame";
import {
  formatIncidentId,
  getIncident,
  getIncidentActivity,
  type ActivityEvent,
  type IncidentStatus,
} from "../../data/incidents";
import styles from "./IssuesDetails.module.css";

interface IssuesDetailsProps {
  /** Route param from /incidents/:id */
  id?: string;
}

const BACK = { to: "/incidents", label: "Back to history" };

export default function IssuesDetails({ id }: IssuesDetailsProps) {
  const incident = useMemo(() => getIncident(id), [id]);

  if (!incident) {
    return (
      <AppShell>
        <PageHeader title="Incident not found" back={BACK} />
        <Panel aria-label="Incident not found">
          <div className={styles.notFound}>
            <p>
              No incident matches{" "}
              <span className="mono">{id ? `#${id}` : "that address"}</span>. It
              may have been merged or removed.
            </p>
            <Button to={BACK.to} variant="ghost">
              Back to history
            </Button>
          </div>
        </Panel>
      </AppShell>
    );
  }

  return <IncidentView key={incident.id} incidentId={incident.id} />;
}

function IncidentView({ incidentId }: { incidentId: number }) {
  const incident = getIncident(incidentId)!;
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [note, setNote] = useState("");
  const [events, setEvents] = useState<ActivityEvent[]>(() =>
    getIncidentActivity(incidentId),
  );

  const idLabel = formatIncidentId(incidentId);

  const logEvent = (event: ActivityEvent) => setEvents((prev) => [event, ...prev]);

  const dispatch = () => {
    setStatus("dispatched");
    logEvent({
      id: `local-${Date.now()}`,
      kind: "dispatch",
      message: note.trim()
        ? `You dispatched a team to incident ${idLabel}: “${note.trim()}”`
        : `You dispatched a team to incident ${idLabel}`,
      time: "just now",
    });
    setNote("");
  };

  const resolve = () => {
    setStatus("resolved");
    logEvent({
      id: `local-${Date.now()}`,
      kind: "resolve",
      message: `You resolved incident ${idLabel}`,
      time: "just now",
    });
  };

  return (
    <AppShell>
      <PageHeader
        title={`Incident ${idLabel}`}
        back={BACK}
        meta={
          <div className={styles.tags}>
            <PriorityTag priority={incident.priority} size="lg" />
            <StatusTag status={status} size="lg" />
          </div>
        }
      />

      <div className={styles.layout}>
        <Panel aria-label={`Incident ${idLabel} details`}>
          <div className={styles.work}>
            <p className={styles.assignee}>
              <Avatar name={incident.assignee ?? "Unassigned"} />
              {incident.assignee ? (
                <span>
                  Assigned to <strong>{incident.assignee}</strong>
                </span>
              ) : (
                <span>Unassigned</span>
              )}
            </p>

            <p className={styles.description}>{incident.detail}</p>

            <TextAreaField
              label="Note for dispatch team"
              hint="Add instructions for the dispatch team before you send them."
              placeholder="e.g. Approach from the Shibuya on-ramp; right two lanes affected."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />

            <div className={styles.actions}>
              <Button
                variant="dispatch"
                size="lg"
                icon="dispatch"
                onClick={dispatch}
                disabled={status === "resolved"}
              >
                Dispatch team
              </Button>
              <Button
                variant="resolve"
                size="lg"
                icon="check"
                onClick={resolve}
                disabled={status === "resolved"}
              >
                Mark resolved
              </Button>
            </div>

            <hr className={styles.divider} />

            <span className={cx("label", styles.activityHeading)}>Activity</span>
            <ActivityFeed
              events={events}
              emptyMessage="No activity on this incident yet."
            />
          </div>
        </Panel>

        <aside className={styles.aside}>
          <MediaFrame
            label="Snapshot"
            status="CCTV S-118"
            placeholder="Live snapshot feed"
          />
          <MediaFrame
            label="Map"
            status={incident.location}
            placeholder="Incident location map"
          />
        </aside>
      </div>
    </AppShell>
  );
}
