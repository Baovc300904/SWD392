import { MoreVertical, Plus } from 'lucide-react';

export function TaskBoardView() {
  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-gray-100',
      tasks: [
        {
          id: 1,
          title: 'Set up project repository',
          assignee: { name: 'Van A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1' },
          priority: 'High',
          tags: ['Setup'],
        },
        {
          id: 2,
          title: 'Design database schema',
          assignee: { name: 'Van C', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3' },
          priority: 'High',
          tags: ['Database'],
        },
      ],
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      color: 'bg-blue-100',
      tasks: [
        {
          id: 3,
          title: 'Implement user authentication',
          assignee: { name: 'Thi B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2' },
          priority: 'Medium',
          tags: ['Backend'],
        },
        {
          id: 4,
          title: 'Create landing page design',
          assignee: { name: 'Thi D', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4' },
          priority: 'Medium',
          tags: ['Design', 'Frontend'],
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      color: 'bg-yellow-100',
      tasks: [
        {
          id: 5,
          title: 'API documentation',
          assignee: { name: 'Van A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1' },
          priority: 'Low',
          tags: ['Documentation'],
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: 'bg-green-100',
      tasks: [
        {
          id: 6,
          title: 'Project proposal submitted',
          assignee: { name: 'Van A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1' },
          priority: 'High',
          tags: ['Documentation'],
        },
        {
          id: 7,
          title: 'Team meeting notes',
          assignee: { name: 'Thi B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2' },
          priority: 'Low',
          tags: ['Meeting'],
        },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900"># 📋 task-board</h1>
            <p className="text-sm text-gray-600 mt-0.5">Organize and track project tasks</p>
          </div>
          <button className="flex items-center gap-2 bg-[#F27125] hover:bg-[#d96420] text-white px-4 py-2 rounded-lg font-medium transition">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col w-80">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-500">({column.tasks.length})</span>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 text-sm leading-snug flex-1 pr-2">
                        {task.title}
                      </h4>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-xs text-gray-600">{task.assignee.name}</span>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          task.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add Card Button */}
                <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition">
                  + Add card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


