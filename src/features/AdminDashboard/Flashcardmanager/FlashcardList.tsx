import React, { useEffect, useState } from 'react';
import LeftMenu from '../LeftMenu';
import type { FlashcardSet } from './flashcardService';
import { getAllFlashcardSets, deleteFlashcardSet, updateFlashcardSetStatus } from './flashcardService';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { useTheme } from '@mui/material/styles';

const FlashcardList = () => {
    const theme = useTheme();

    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [searchName, setSearchName] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterUserId, setFilterUserId] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    useEffect(() => {
        const fetchData = async () => {
            let sets = await getAllFlashcardSets();
            sets = sets.map(set => ({
                ...set,
                status: typeof set.status === 'boolean' ? set.status : true
            }));
            setFlashcardSets(sets);
        };
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchName, filterStatus, filterUserId, sortOrder]);

    const toggleStatus = async (id: string) => {
        setFlashcardSets(prev =>
            prev.map(set =>
                set.id === id ? { ...set, status: !set.status } : set
            )
        );

        const setToUpdate = flashcardSets.find(set => set.id === id);
        if (setToUpdate) {
            const newStatus = !setToUpdate.status;
            const success = await updateFlashcardSetStatus(id, newStatus);
            if (!success) {
                alert("Failed to update status on server.");
                setFlashcardSets(prev =>
                    prev.map(set =>
                        set.id === id ? { ...set, status: setToUpdate.status } : set
                    )
                );
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this flashcard set?")) return;
        const success = await deleteFlashcardSet(id);
        if (success) {
            setFlashcardSets(prev => prev.filter(set => set.id !== id));
        } else {
            alert("Failed to delete flashcard set.");
        }
    };

    const filteredSets = flashcardSets
        .filter(set =>
            set.name.toLowerCase().includes(searchName.toLowerCase()) &&
            (filterStatus === 'all' || String(set.status) === filterStatus) &&
            (filterUserId.trim() === '' || set.userId.includes(filterUserId))
        )
        .sort((a, b) =>
            sortOrder === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        );

    const paginatedSets = filteredSets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
            <LeftMenu />
            <div className="ml-[240px] p-6">
                <div className="flex justify-between mb-4">
                    <h2
                        className="text-3xl font-bold"
                        style={{ color: theme.palette.primary.main }}
                    >
                        Flashcard Sets
                    </h2>
                </div>

                {/* Filters */}
                <div
                    className="p-4 rounded mb-6 shadow flex flex-wrap items-center gap-6"
                    style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                >
                    <div>
                        <label className="mr-2 font-semibold">Name:</label>
                        <input
                            type="text"
                            className="border px-2 py-1 rounded"
                            style={{
                                backgroundColor: theme.palette.background.default,
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.primary
                            }}
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Search by name"
                        />
                    </div>
                    <div>
                        <label className="mr-2 font-semibold">Status:</label>
                        <select
                            className="border px-2 py-1 rounded"
                            style={{
                                backgroundColor: theme.palette.background.default,
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.primary
                            }}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="true">Show</option>
                            <option value="false">Hide</option>
                        </select>
                    </div>
                    <div>
                        <label className="mr-2 font-semibold">User ID:</label>
                        <input
                            type="text"
                            className="border px-2 py-1 rounded"
                            style={{
                                backgroundColor: theme.palette.background.default,
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.primary
                            }}
                            value={filterUserId}
                            onChange={(e) => setFilterUserId(e.target.value)}
                            placeholder="Filter by User ID"
                        />
                    </div>
                    <div>
                        <label className="mr-2 font-semibold">Sort Name:</label>
                        <select
                            className="border px-2 py-1 rounded"
                            style={{
                                backgroundColor: theme.palette.background.default,
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.primary
                            }}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        >
                            <option value="asc">A-Z</option>
                            <option value="desc">Z-A</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div
                    className="shadow-lg rounded-lg overflow-auto"
                    style={{ backgroundColor: theme.palette.background.paper }}
                >
                    <table className="min-w-full text-left text-sm">
                        <thead style={{ backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">User ID</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSets.length > 0 ? (
                                paginatedSets.map((set) => {
                                    const isExpanded = expandedRow === set.id;
                                    const description =
                                        !isExpanded && set.description.length > 60
                                            ? set.description.slice(0, 60) + "..."
                                            : set.description;

                                    return (
                                        <tr key={set.id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                            <td className="px-4 py-2" style={{ color: theme.palette.text.primary }}>{set.id}</td>
                                            <td className="px-4 py-2" style={{ color: theme.palette.text.primary }}>{set.userId}</td>
                                            <td className="px-4 py-2 font-semibold" style={{ color: theme.palette.text.primary }}>{set.name}</td>
                                            <td
                                                className="px-4 py-2 align-top"
                                                style={{
                                                    color: theme.palette.text.secondary,
                                                    maxWidth: "300px",
                                                    whiteSpace: isExpanded ? "normal" : "nowrap",
                                                    overflow: isExpanded ? "visible" : "hidden",
                                                    textOverflow: isExpanded ? "clip" : "ellipsis"
                                                }}
                                            >
                                                {set.description.length > 60 && !isExpanded
                                                    ? set.description.slice(0, 60) + "..."
                                                    : set.description}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => toggleStatus(set.id)}
                                                    style={{
                                                        backgroundColor: set.status ? theme.palette.success.light : theme.palette.grey[400],
                                                        color: set.status ? theme.palette.success.contrastText : theme.palette.text.primary
                                                    }}
                                                    className="px-3 py-1 rounded-md text-sm font-medium shadow-sm"
                                                >
                                                    {set.status ? "Show" : "Hide"}
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 space-x-2 text-center">
                                                <Link to={`/library/flashcard/${set.id}/play`} state={{ from: "manageflashcard" }}>
                                                    <button
                                                        className="px-3 py-1 rounded-md shadow-sm"
                                                        style={{ backgroundColor: theme.palette.info.main, color: theme.palette.info.contrastText }}
                                                    >
                                                        View
                                                    </button>
                                                </Link>
                                                <Link to={`/library/flashcard/edit/${set.id}`} state={{ from: "manageflashcard" }}>
                                                    <button
                                                        className="px-3 py-1 rounded-md shadow-sm"
                                                        style={{ backgroundColor: theme.palette.warning.main, color: theme.palette.warning.contrastText }}
                                                    >
                                                        Edit
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(set.id)}
                                                    className="px-3 py-1 rounded-md shadow-sm"
                                                    style={{ backgroundColor: theme.palette.error.main, color: theme.palette.error.contrastText }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-4" style={{ color: theme.palette.text.secondary }}>
                                        No flashcard sets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredSets.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default FlashcardList;
