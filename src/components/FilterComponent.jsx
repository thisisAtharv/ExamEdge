import React from 'react';
import { Search } from 'lucide-react';

function FilterComponent({
  searchTerm,
  onSearchChange,
  subjects,
  selectedSubject,
  onSubjectChange,
  types,
  selectedType,
  onTypeChange,
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={onSubjectChange}
          className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject === "all" ? "All Subjects" : subject}
            </option>
          ))}
        </select>

        {/* Type Filter (Optional) */}
        {types && (
          <select
            value={selectedType}
            onChange={onTypeChange}
            className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

export default FilterComponent;