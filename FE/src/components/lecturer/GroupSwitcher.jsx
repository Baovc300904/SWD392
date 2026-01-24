import { Plus, GraduationCap } from 'lucide-react';

export function GroupSwitcher({ activeGroup, onGroupChange }) {
  const groups = [
    {
      semester: 'Spring 2026',
      groups: [
        { id: 'G01', name: 'Group 01', color: '#FF6B6B' },
        { id: 'G02', name: 'Group 02', color: '#4ECDC4' },
        { id: 'G03', name: 'Group 03', color: '#45B7D1' },
        { id: 'G04', name: 'Group 04', color: '#F7B731' },
      ],
    },
    {
      semester: 'Fall 2025',
      groups: [
        { id: 'G05', name: 'Group 05', color: '#5F27CD' },
        { id: 'G06', name: 'Group 06', color: '#00D2D3' },
      ],
    },
  ];

  const isDashboardActive = activeGroup === 'dashboard';

  return (
    <div className="w-[72px] bg-[#1a1d21] flex flex-col items-center py-3 gap-2 h-screen overflow-y-auto">
      {/* Home/Dashboard Button */}
      <button
        onClick={() => onGroupChange('dashboard')}
        className="relative w-12 h-12 hover:rounded-[16px] transition-all duration-200 flex items-center justify-center group"
        style={{
          background: isDashboardActive 
            ? 'linear-gradient(135deg, #0054a6 0%, #F27125 100%)'
            : '#2c2f33',
          borderRadius: isDashboardActive ? '16px' : '24px',
        }}
        title="Dashboard"
      >
        <GraduationCap className="w-6 h-6 text-white" />
        {/* Active Indicator */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 bg-white rounded-r transition-all duration-200"
          style={{
            height: isDashboardActive ? '40px' : '0px',
          }}
        />
        {/* Hover Indicator */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-0 bg-white rounded-r group-hover:h-5 transition-all duration-200" />
      </button>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-[#2c2f33] rounded-full my-1" />

      {/* Groups by Semester */}
      {groups.map((semester, semesterIdx) => (
        <div key={semesterIdx} className="w-full flex flex-col items-center gap-2">
          {/* Semester Label (on hover) */}
          <div className="relative group/label">
            <div className="w-8 h-[2px] bg-[#2c2f33] rounded-full" />
            <div className="absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover/label:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap shadow-lg">
                {semester.semester}
              </div>
            </div>
          </div>

          {/* Group Icons */}
          {semester.groups.map((group) => {
            const isActive = activeGroup === group.id;
            
            return (
              <button
                key={group.id}
                onClick={() => onGroupChange(group.id)}
                className="relative w-12 h-12 hover:rounded-[16px] transition-all duration-200 flex items-center justify-center group"
                style={{
                  backgroundColor: group.color,
                  borderRadius: isActive ? '16px' : '24px',
                }}
                title={group.name}
              >
                <span className="text-white font-bold text-sm">{group.id}</span>
                
                {/* Active Indicator */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 bg-white rounded-r transition-all duration-200"
                  style={{
                    height: isActive ? '40px' : '0px',
                  }}
                />

                {/* Hover Indicator */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-0 bg-white rounded-r group-hover:h-5 transition-all duration-200" />

                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap shadow-lg">
                    {group.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}

      {/* Separator */}
      <div className="w-8 h-[2px] bg-[#2c2f33] rounded-full my-1" />

      {/* Add Group Button */}
      <button
        className="relative w-12 h-12 bg-[#2c2f33] hover:bg-[#3ba55d] hover:rounded-[16px] rounded-[24px] transition-all duration-200 flex items-center justify-center group"
        title="Add New Group"
      >
        <Plus className="w-6 h-6 text-[#3ba55d] group-hover:text-white transition-colors" />
        
        {/* Tooltip */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap shadow-lg">
            Add New Group
          </div>
        </div>
      </button>

      {/* Spacer to push to bottom */}
      <div className="flex-1" />
    </div>
  );
}

