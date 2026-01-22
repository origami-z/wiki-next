import { EventStage } from "@/types/events";

interface EventStagesProps {
  stages: EventStage[];
}

export function EventStages({ stages }: EventStagesProps) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2 dark:border-gray-800">Event Stages</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stages.sort((a,b) => a.order - b.order).map((stage) => (
          <div key={stage.id} className="rounded-lg border bg-card p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="float-right text-sm text-gray-500 font-mono">#{stage.order}</div>
            <h4 className="font-semibold mb-3">{stage.name}</h4>
            
            {stage.requirements.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Requirements</p>
                <ul className="text-sm space-y-1">
                  {stage.requirements.map((req, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{req.itemName}</span>
                      <span className="font-mono text-gray-600 dark:text-gray-400">x{req.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {stage.rewards.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Rewards</p>
                <ul className="text-sm space-y-1">
                  {stage.rewards.map((reward, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded">
                      <span className={reward.rarity ? `text-${reward.rarity}-500` : ''}>{reward.itemName}</span>
                      <span className="font-bold text-xs bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded shadow-sm">
                        x{reward.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
