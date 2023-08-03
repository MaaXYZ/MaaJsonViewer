import Awards from './awards.json'
import Combat_Act from './combat_activity.json'
import Combat from './combat.json'
import Psychube from './psychube.json'
import Startup from './startup.json'
import Wilderness from './wilderness.json'
import { taskData, type TaskData } from '@/data'

function appendPath(data: TaskData, path: string) {
  for (const key in data) {
    data[key].editor_info = {
      ...(data[key].editor_info ?? {}),
      path
    }
  }
  return data
}

export function loadData() {
  taskData.data = {
    ...appendPath(Awards as any, 'Awards'),
    ...appendPath(Combat_Act as any, 'CombatActivity'),
    ...appendPath(Combat as any, 'Combat'),
    ...appendPath(Psychube as any, 'Psychube'),
    ...appendPath(Startup as any, 'Startup'),
    ...appendPath(Wilderness as any, 'Wilderness')
  }
}
