import { useState } from 'react';

type TaskPriority = 'user-blocking' | 'user-visible' | 'background';

interface SchedulerLike {
  postTask: <T>(callback: () => T, options?: { priority?: TaskPriority }) => Promise<T>;
}

function getScheduler(): SchedulerLike {
  return (window as unknown as { scheduler: SchedulerLike }).scheduler;
}

// Queued in a deliberately mixed order to show the scheduler reorders by priority.
const TASKS: Array<{ label: string; priority: TaskPriority }> = [
  { label: 'Background A', priority: 'background' },
  { label: 'User-blocking A', priority: 'user-blocking' },
  { label: 'User-visible A', priority: 'user-visible' },
  { label: 'Background B', priority: 'background' },
  { label: 'User-blocking B', priority: 'user-blocking' },
  { label: 'User-visible B', priority: 'user-visible' },
];

const COLORS: Record<TaskPriority, string> = {
  'user-blocking': 'var(--danger)',
  'user-visible': 'var(--accent)',
  background: 'var(--text-dim)',
};

export default function SchedulerDemo() {
  const [order, setOrder] = useState<Array<{ label: string; priority: TaskPriority }>>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setOrder([]);
    const scheduler = getScheduler();
    const executed: Array<{ label: string; priority: TaskPriority }> = [];
    await Promise.all(
      TASKS.map((task) =>
        scheduler.postTask(
          () => {
            executed.push(task);
          },
          { priority: task.priority },
        ),
      ),
    );
    setOrder(executed);
    setRunning(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Six tasks are queued in a shuffled order. The scheduler runs them by priority: user-blocking
        first, then user-visible, then background.
      </p>
      <button type="button" onClick={run} disabled={running}>
        Queue tasks
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            Queued (source order)
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {TASKS.map((task) => (
              <li key={task.label} style={{ color: COLORS[task.priority] }}>
                {task.label}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            Executed order
          </div>
          <ol role="status" style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {order.length === 0 ? (
              <li style={{ color: 'var(--text-dim)', listStyle: 'none', marginLeft: '-1.1rem' }}>
                —
              </li>
            ) : (
              order.map((task) => (
                <li key={task.label} style={{ color: COLORS[task.priority] }}>
                  {task.label}
                </li>
              ))
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
