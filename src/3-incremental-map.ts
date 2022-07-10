enum ActionName {
  ADD = 'ADD',
  DELETE = 'DELETE',
  UPDATE = 'UPDATE',
  SNAPSHOT = 'SNAPSHOT',
}

interface Action<K, V> {
  actionName: ActionName;
  key?: K;
  value?: V;
  snapshotName?: string | number;
}

class IncrementalMap<K = any, V = any> {
  private _snapshotsInStack: (string | number)[];

  private _actions: Action<K, V>[];

  private _originalMap: Map<K, V>;

  constructor() {
    this._actions = [];
    this._originalMap = new Map<K, V>();
    this._snapshotsInStack = [];
  }

  private _revertAction(action: Action<K, V>): void {
    switch (action.actionName) {
      case ActionName.ADD: {
        this._originalMap.delete(action.key!);
        return;
      }
      case ActionName.UPDATE: {
        this._originalMap.set(action.key!, action.value!);
        return;
      }
      case ActionName.DELETE: {
        this._originalMap.set(action.key!, action.value!);
        return;
      }
    }
  }

  private _addAction(action: Action<K, V>): void {
    this._actions.unshift(action);
  }

  set(key: K, value: V): void {
    const item = this._originalMap.get(key);
    if (item) {
      this._addAction({ actionName: ActionName.UPDATE, key, value: item });
    } else {
      this._addAction({ actionName: ActionName.ADD, key, value });
    }

    this._originalMap.set(key, value);
  }

  get(key: K): V | undefined {
    return this._originalMap.get(key);
  }

  delete(key: K): boolean {
    const value = this._originalMap.get(key);
    if (value) {
      this._addAction({ actionName: ActionName.DELETE, key, value });
    }

    return this._originalMap.delete(key);
  }

  public snapshot(snapshotName: string | number): void {
    if (this._snapshotsInStack.find((item) => snapshotName === item)) {
      throw new Error(`Snapshot with name ${snapshotName} already exist`);
    }

    this._snapshotsInStack.push(snapshotName);
    this._addAction({ actionName: ActionName.SNAPSHOT, snapshotName });
  }

  public loadSnapshot(snapshotName: string | number): void {
    const snapshotIdndex = this._snapshotsInStack.indexOf(snapshotName);

    if (snapshotIdndex === -1) {
      throw new Error(`Snapshot with name ${snapshotName} not found`);
    }

    const action: Action<K, V>[] = JSON.parse(JSON.stringify(this._actions));

    for (const item of action) {
      if (
        item.actionName === ActionName.SNAPSHOT &&
        item.snapshotName === snapshotName
      ) {
        break;
      }

      this._revertAction(item);
      this._actions.shift();
    }

    this._snapshotsInStack = this._snapshotsInStack.slice(
      0,
      snapshotIdndex + 1,
    );
  }
}

const map = new IncrementalMap();

map.set('a', 20);
map.set('b', 20);

map.snapshot(1);

map.set('b', 22);

console.log(map.get('b')); // 22

map.loadSnapshot(1);

console.log(map.get('b')); // 20

map.set('c', 22);

map.snapshot(2);

map.delete('c');

console.log(map.get('c')); // undefined

map.loadSnapshot(2);

console.log(map.get('c')); // 22
