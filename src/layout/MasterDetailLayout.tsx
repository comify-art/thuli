import React, { ReactNode } from 'react';

export interface SearchConfig {
    query: string;
    onSearchChange: (query: string) => void;
    placeholder?: string;
}

export interface MasterDetailLayoutProps {
    /** Content for the left list view */
    leftChildren: ReactNode;
    /** Content for the right detail view */
    rightChildren: ReactNode;
    /** Optional header content for the left pane (sticky at top) */
    leftHeader?: ReactNode;
    /** Optional header content for the right pane (sticky at top) */
    rightHeader?: ReactNode;
    /** Configuration for a standard search bar in the left pane */
    searchConfig?: SearchConfig;
    /** content to display below search bar (e.g. filter chips) */
    filterConfig?: ReactNode;
    /** Optional additional classes for the outer container */
    className?: string;
}

const MasterDetailLayout: React.FC<MasterDetailLayoutProps> = ({
    leftChildren,
    rightChildren,
    leftHeader,
    rightHeader,
    searchConfig,
    filterConfig,
    className = ''
}) => {
    return (
        <div className={`flex h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-white dark:bg-gray-900 ${className}`}>
            {/* Left Column: List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
                {/* Sticky Header Section */}
                {(leftHeader || searchConfig || filterConfig) && (
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                        {/* Custom Header Title/Content */}
                        {leftHeader && (
                            <div className="p-3 font-semibold text-lg text-gray-700 dark:text-gray-200">
                                {leftHeader}
                            </div>
                        )}

                        {/* Search Bar */}
                        {searchConfig && (
                            <div className="px-3 pb-3 pt-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={searchConfig.placeholder || "Search..."}
                                        value={searchConfig.query}
                                        onChange={(e) => searchConfig.onSearchChange(e.target.value)}
                                        className="w-full px-3 py-2 pl-9 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        {filterConfig && (
                            <div className="px-3 pb-3">
                                {filterConfig}
                            </div>
                        )}
                    </div>
                )}

                {/* Scrollable List Content */}
                <div className="flex-1 overflow-y-auto">
                    {leftChildren}
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-gray-800">
                {/* Right Header */}
                {rightHeader && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
                        {rightHeader}
                    </div>
                )}

                {/* Scrollable Detail Content */}
                <div className="flex-1 overflow-y-auto">
                    {rightChildren}
                </div>
            </div>
        </div>
    );
};

export default MasterDetailLayout;
