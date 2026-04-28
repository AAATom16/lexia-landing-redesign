import { Plus, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tasks, formatDate, type Task } from './mock-data';

const statusColors: Record<string, string> = {
  Nová: 'bg-[#0045BF]/10 text-[#0045BF]',
  'V řešení': 'bg-[#0057F0]/10 text-[#0057F0]',
  Hotovo: 'bg-[#008EA5]/10 text-[#008EA5]',
};

const priorityColors: Record<string, string> = {
  Vysoká: 'bg-[#df1929]/10 text-[#df1929] border-[#df1929]/30',
  Střední: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  Nízká: 'bg-muted text-muted-foreground border-border',
};

const TODAY = new Date('2026-04-28');

function TaskCard({ task }: { task: Task }) {
  const due = new Date(task.dueDate);
  const overdue = task.status !== 'Hotovo' && due < TODAY;
  const initials = task.assignee.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <div className={`rounded-xl bg-white border p-4 hover:shadow-sm transition-shadow ${overdue ? 'border-[#df1929]/30' : 'border-border'}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.status === 'Hotovo'}
          readOnly
          className="mt-1 w-4 h-4 rounded border-border accent-[#0045BF]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className={`text-sm font-medium ${task.status === 'Hotovo' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${priorityColors[task.priority]}`}>{task.priority}</span>
          </div>
          <Link to={`/crm/klienti/${task.clientId}`} className="text-xs text-[#0045BF] hover:underline">{task.clientName}</Link>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className={`flex items-center gap-1 ${overdue ? 'text-[#df1929] font-medium' : ''}`}>
              {overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              {formatDate(task.dueDate)}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0045BF] to-[#001843] text-white text-[9px] font-medium flex items-center justify-center">{initials}</div>
              <span>{task.assignee.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrmTasksPage() {
  const groups = [
    { id: 'Nová', label: 'Nové', tasks: tasks.filter((t) => t.status === 'Nová') },
    { id: 'V řešení', label: 'V řešení', tasks: tasks.filter((t) => t.status === 'V řešení') },
    { id: 'Hotovo', label: 'Hotovo', tasks: tasks.filter((t) => t.status === 'Hotovo') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Úkoly</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {tasks.filter((t) => t.status !== 'Hotovo').length} otevřených ·{' '}
            <span className="text-[#df1929]">{tasks.filter((t) => t.status !== 'Hotovo' && new Date(t.dueDate) < TODAY).length} po termínu</span>
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={2} /> Nový úkol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div key={g.id} className="rounded-2xl bg-[#F1F4FA] p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                {g.id === 'Hotovo' && <CheckCircle2 className="w-4 h-4 text-[#008EA5]" />}
                <h2 className="text-sm font-semibold">{g.label}</h2>
                <span className={`px-2 py-0.5 rounded-md text-xs ${statusColors[g.id]}`}>{g.tasks.length}</span>
              </div>
            </div>
            <div className="space-y-2">
              {g.tasks.map((t) => <TaskCard key={t.id} task={t} />)}
              {g.tasks.length === 0 && <div className="text-xs text-muted-foreground text-center py-8">Žádné úkoly</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
