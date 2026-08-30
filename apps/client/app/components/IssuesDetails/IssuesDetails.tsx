import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

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
  type ActivityEvent,
  type Incident,
} from "../../data/incidents";
import styles from "./IssuesDetails.module.css";

type IncidentDetail = Incident & { activity: ActivityEvent[] };

/** Shape returned by the IncidentDetails route action. */
type ResponseResult = { ok: true; intent: string } | { ok: false; error: string };

interface IssuesDetailsProps {
  /** Incident loaded from `GET /api/incidents/:id`, or null when nothing matched. */
  incident: IncidentDetail | null;
  /** The raw :id from the URL, shown in the not-found message. */
  requestedId?: string;
}

const BACK = { to: "/incidents", label: "Back to history" };

export default function IssuesDetails({
  incident,
  requestedId,
}: IssuesDetailsProps) {
  if (!incident) {
    return (
      <AppShell>
        <PageHeader title="Incident not found" back={BACK} />
        <Panel aria-label="Incident not found">
          <div className={styles.notFound}>
            <p>
              No incident matches{" "}
              <span className="mono">
                {requestedId ? `#${requestedId}` : "that address"}
              </span>
              . It may have been merged or removed.
            </p>
            <Button to={BACK.to} variant="ghost">
              Back to history
            </Button>
          </div>
        </Panel>
      </AppShell>
    );
  }

  return <IncidentView key={incident.id} incident={incident} />;
}

function IncidentView({ incident }: { incident: IncidentDetail }) {
  const fetcher = useFetcher<ResponseResult>();
  const idLabel = formatIncidentId(incident.id);

  // Server-owned state — the route loader revalidates after every submit.
  const events = incident.activity ?? [];
  const isResolved = incident.status === "resolved";

  const sending = fetcher.state !== "idle";
  const pendingIntent = fetcher.formData?.get("intent");
  const error =
    fetcher.data && fetcher.data.ok === false ? fetcher.data.error : undefined;

  // Clear the note field once a submit has landed successfully.
  const [noteKey, setNoteKey] = useState(0);
  const seenData = useRef(fetcher.data);
  useEffect(() => {
    if (fetcher.state !== "idle" || fetcher.data === seenData.current) return;
    seenData.current = fetcher.data;
    if (fetcher.data?.ok) setNoteKey((key) => key + 1);
  }, [fetcher.state, fetcher.data]);

  return (
    <AppShell>
      <PageHeader
        title={`Incident ${idLabel}`}
        back={BACK}
        meta={
          <div className={styles.tags}>
            <PriorityTag priority={incident.priority} size="lg" />
            <StatusTag status={incident.status} size="lg" />
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

            <fetcher.Form method="post" className={styles.responseForm}>
              <TextAreaField
                key={noteKey}
                name="note"
                label="Note for dispatch team"
                hint="Add instructions for the dispatch team before you send them."
                placeholder="e.g. Approach from the Shibuya on-ramp; right two lanes affected."
                defaultValue=""
                disabled={sending || isResolved}
              />

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              <div className={styles.actions}>
                <Button
                  type="submit"
                  name="intent"
                  value="dispatch"
                  variant="dispatch"
                  size="lg"
                  icon="dispatch"
                  disabled={isResolved || sending}
                >
                  {sending && pendingIntent === "dispatch"
                    ? "Sending…"
                    : "Dispatch team"}
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="resolve"
                  variant="resolve"
                  size="lg"
                  icon="check"
                  disabled={isResolved || sending}
                >
                  {sending && pendingIntent === "resolve"
                    ? "Sending…"
                    : "Mark resolved"}
                </Button>
              </div>
            </fetcher.Form>

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
