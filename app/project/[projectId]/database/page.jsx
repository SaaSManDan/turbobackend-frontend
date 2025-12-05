"use client";

import { use, useState } from 'react';
import { useApi } from '@/lib/client/hooks/useApi';
import { Loader2, Database, Table, Key, Link as LinkIcon, ChevronDown, ChevronRight } from 'lucide-react';

// ============================================
// EXAMPLE DATA - Comment out this section when using real API data
// ============================================
const EXAMPLE_DATA = {
    databases: [
        {
            database_id: "example_db_001",
            db_name: "my_application_db",
            db_schema: JSON.stringify({
                tables: [
                    {
                        tableName: "users",
                        columns: [
                            { name: "user_id", type: "varchar", primaryKey: true, nullable: false },
                            { name: "email", type: "varchar", unique: true, nullable: false },
                            { name: "username", type: "varchar", unique: true, nullable: false },
                            { name: "created_at", type: "bigint", nullable: false }
                        ],
                        indexes: [
                            { name: "idx_users_email", columns: ["email"] }
                        ]
                    },
                    {
                        tableName: "posts",
                        columns: [
                            { name: "post_id", type: "varchar", primaryKey: true, nullable: false },
                            { name: "user_id", type: "varchar", nullable: false, foreignKey: { table: "users", column: "user_id", onDelete: "CASCADE" } },
                            { name: "title", type: "varchar", nullable: false },
                            { name: "content", type: "text", nullable: true },
                            { name: "status", type: "varchar", nullable: false, default: "draft" },
                            { name: "created_at", type: "bigint", nullable: false },
                            { name: "updated_at", type: "bigint", nullable: false }
                        ],
                        indexes: [
                            { name: "idx_posts_user_id", columns: ["user_id"] },
                            { name: "idx_posts_status", columns: ["status"] }
                        ]
                    }
                ]
            }),
            environment: "development",
            is_active: true,
            created_at: 1701234567,
            updated_at: 1701234567
        }
    ]
};
// ============================================
// END EXAMPLE DATA
// ============================================

export default function DatabasePage({ params }) {
    const { projectId } = use(params);
    const [openTables, setOpenTables] = useState({});

    // ============================================
    // TO USE REAL API DATA:
    // 1. Comment out the EXAMPLE_DATA section above
    // 2. Uncomment the useApi hook below
    // 3. Comment out the line: const databases = EXAMPLE_DATA.databases;
    // 4. Uncomment the line: const databases = databasesData?.databases || [];
    // ============================================

    // Fetch project databases from API
    // const { data: databasesData, loading, error } = useApi(
    //     `/v1/getProjectDatabases?projectId=${projectId}&environment=development`,
    //     { method: 'GET', immediate: true }
    // );

    // Using example data (comment this out when using real API)
    const loading = false;
    const error = null;
    const databases = EXAMPLE_DATA.databases;
    
    // Using real API data (uncomment this when ready)
    // const databases = databasesData?.databases || [];

    function toggleTable(tableKey) {
        setOpenTables(function(prev) {
            return {
                ...prev,
                [tableKey]: !prev[tableKey]
            };
        });
    }

    function renderColumnBadge(column) {
        const badges = [];
        
        if (column.primaryKey) {
            badges.push(
                <span key="pk" className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    PRIMARY KEY
                </span>
            );
        }
        
        if (column.foreignKey) {
            badges.push(
                <span key="fk" className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    FK → {column.foreignKey.table}.{column.foreignKey.column}
                </span>
            );
        }
        
        if (column.unique && !column.primaryKey) {
            badges.push(
                <span key="unique" className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    UNIQUE
                </span>
            );
        }
        
        if (!column.nullable) {
            badges.push(
                <span key="notnull" className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    NOT NULL
                </span>
            );
        }
        
        if (column.default !== undefined) {
            badges.push(
                <span key="default" className="px-2 py-0.5 text-xs font-mono rounded bg-gray-500/20 text-gray-300 border border-gray-500/30">
                    DEFAULT: {column.default}
                </span>
            );
        }
        
        return badges;
    }

    function renderTable(table, databaseId) {
        const tableKey = `${databaseId}_${table.tableName}`;
        const isOpen = openTables[tableKey];

        return (
            <div key={table.tableName} className="border border-white/10 rounded-lg bg-[#0f0f23] overflow-hidden">
                {/* Table Header - Clickable */}
                <button
                    onClick={function() { toggleTable(tableKey); }}
                    className="w-full px-6 py-4 bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Table className="h-5 w-5 text-blue-400" />
                            <h3 className="text-lg font-bold text-white font-mono">{table.tableName}</h3>
                            <span className="text-sm text-gray-400">
                                {table.columns.length} column{table.columns.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                    <>
                        {/* Columns */}
                        <div className="p-6">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Columns</h4>
                            <div className="space-y-3">
                                {table.columns.map(function(column) {
                                    return (
                                        <div key={column.name} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 flex-wrap">
                                            <span className="font-mono text-white font-semibold">{column.name}</span>
                                            <span className="px-2 py-0.5 text-xs font-mono rounded bg-green-500/20 text-green-300 border border-green-500/30">
                                                {column.type}
                                            </span>
                                            {renderColumnBadge(column)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Indexes */}
                        {table.indexes && table.indexes.length > 0 && (
                            <div className="px-6 pb-6">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Indexes</h4>
                                <div className="space-y-2">
                                    {table.indexes.map(function(index) {
                                        return (
                                            <div key={index.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                                <Key className="h-4 w-4 text-gray-400" />
                                                <span className="font-mono text-sm text-white">{index.name}</span>
                                                <span className="text-sm text-gray-400">on</span>
                                                <span className="font-mono text-sm text-blue-300">
                                                    ({index.columns.join(', ')})
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

    function renderDatabase(database) {
        let schema;
        try {
            schema = typeof database.db_schema === 'string' 
                ? JSON.parse(database.db_schema) 
                : database.db_schema;
        } catch (err) {
            console.error('Failed to parse database schema:', err);
            return (
                <div key={database.database_id} className="border border-red-500/30 rounded-lg p-6 bg-red-500/10">
                    <p className="text-red-400">Error parsing schema for database: {database.db_name}</p>
                </div>
            );
        }

        return (
            <div key={database.database_id} className="space-y-6">
                {/* Database Header */}
                <div className="border border-white/10 rounded-lg p-6 bg-[#0f0f23]">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="h-6 w-6 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">{database.db_name}</h2>
                        {database.is_active && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                                ACTIVE
                            </span>
                        )}
                    </div>
                    <div className="flex gap-6 text-sm">
                        <div>
                            <span className="text-gray-400">Environment:</span>
                            <span className="ml-2 text-white font-semibold">{database.environment}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Tables:</span>
                            <span className="ml-2 text-white font-semibold">{schema.tables?.length || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Tables */}
                <div className="space-y-4">
                    {schema.tables && schema.tables.length > 0 ? (
                        schema.tables.map(function(table) {
                            return renderTable(table, database.database_id);
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            No tables found in this database
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-400">Error loading databases: {error}</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="px-6 py-4 mb-6 border border-white/10 rounded-lg bg-[#0f0f23]">
                <h1 className="text-2xl font-bold text-white">Database Schemas</h1>
                <p className="text-sm text-gray-400 mt-1">
                    {databases.length} database{databases.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Databases List */}
            {databases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Database className="h-16 w-16 text-gray-600 mb-4" />
                    <div className="text-gray-400 mb-2">No databases found</div>
                    <div className="text-sm text-gray-500">
                        Create a database using the TurboBackend MCP in your AI IDE
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {databases.map(function(database) {
                        return renderDatabase(database);
                    })}
                </div>
            )}
        </div>
    );
}
