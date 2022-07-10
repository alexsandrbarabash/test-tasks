const task = async <T>(value: T) => {
  await new Promise((r) => setTimeout(r, 1000 * Math.random()));
  console.log(value);
};

type Task<T = any> = () => Promise<T>;

class AsyncQueue<T = any> {
  private _tasks: Task<T>[];
  private _is_running: boolean;

  constructor(tasks: Task<T>[] = []) {
    this._tasks = tasks;
    this._is_running = false;

    if (tasks.length) {
      this._is_running = true;
      this._execute().catch((error) => {
        throw new Error(`Task with error: ${error.message}`);
      });
    }
  }

  private async _execute(): Promise<void> {
    if (!this._tasks.length) {
      this._is_running = false;
      return;
    }

    const task = this._tasks.shift() as Task<T>;
    await task();

    await this._execute().catch((error) => {
      throw new Error(`Task with error: ${error.message}`);
    });
  }

  public add(task: Task<T>): void {
    this._tasks.push(task);
    if (!this._is_running) {
      this._is_running = true;
      this._execute();
    }
  }
}

const queue = new AsyncQueue();

Promise.all([
  queue.add(() => task(1)),
  queue.add(() => task(1)),
  queue.add(() => task(2)),
  queue.add(() => task(3)),
  queue.add(() => task(4)),
]);
