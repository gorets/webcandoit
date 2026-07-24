// Queue tasks with explicit priorities.
scheduler.postTask(() => console.log('runs last'), { priority: 'background' });
scheduler.postTask(() => console.log('runs first'), { priority: 'user-blocking' });
scheduler.postTask(() => console.log('runs second'), { priority: 'user-visible' });

// postTask returns a promise, and tasks can be cancelled with an AbortSignal.
const controller = new TaskController({ priority: 'user-visible' });
scheduler
  .postTask(() => expensiveWork(), { signal: controller.signal })
  .then((result) => console.log(result))
  .catch((err) => console.log('aborted:', err.message));

// controller.abort();  // cancel before it runs
