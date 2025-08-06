import React, { useEffect, useState } from 'react';
import LeftMenu from '../LeftMenu';
import type { FlashcardSet } from './flashcardService';
import { getAllFlashcardSets, deleteFlashcardSet } from './flashcardService';
import { Padding } from '@mui/icons-material';
import { Link } from 'react-router-dom';
const FlashcardList = () => {
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [searchName, setSearchName] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterUserId, setFilterUserId] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        const fetchData = async () => {
            const sets = await getAllFlashcardSets();
            setFlashcardSets(sets);
        };
        fetchData();
    }, []);

    const toggleStatus = (id: string) => {
        setFlashcardSets(prev =>
            prev.map(set =>
                set.id === id ? { ...set, status: !set.status } : set
            )
        );
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this flashcard set?");
        if (!confirmDelete) return;

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
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

    useEffect(() => {
        const menu = document.querySelector(".left-menu") as HTMLElement | null;
        const onScroll = () => {
            if (menu) menu.style.top = `${Math.max(0, 63 - window.scrollY)}px`;
        };
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen">
            <LeftMenu />
            <div className="ml-[240px] p-6">
                <div className="flex justify-between mb-4">
                    <h2 className="text-3xl font-bold text-purple-700">Flashcard Sets</h2>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded mb-6 shadow flex flex-wrap items-center gap-6">
                    <div>
                        <label className="mr-2 font-semibold">Name:</label>
                        <input
                            type="text"
                            className="border px-2 py-1 rounded"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Search by name"
                        />
                    </div>
                    <div>
                        <label className="mr-2 font-semibold">Status:</label>
                        <select
                            className="border px-2 py-1 rounded"
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
                            value={filterUserId}
                            onChange={(e) => setFilterUserId(e.target.value)}
                            placeholder="Filter by User ID"
                        />
                    </div>
                    <div>
                        <label className="mr-2 font-semibold">Sort Name:</label>
                        <select
                            className="border px-2 py-1 rounded"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        >
                            <option value="asc">A-Z</option>
                            <option value="desc">Z-A</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-purple-100 text-purple-700 text-base">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">User ID</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 " style={{ paddingLeft: '75px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSets.map((set) => (
                                <tr key={set.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{set.id}</td>
                                    <td className="px-4 py-2">{set.userId}</td>
                                    <td className="px-4 py-2 font-semibold">{set.name}</td>
                                    <td className="px-4 py-2">{set.description}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => toggleStatus(set.id)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium shadow-sm ${set.status
                                                ? 'bg-green-200 text-green-800'
                                                : 'bg-gray-300 text-gray-700'
                                                }`}
                                        >
                                            {set.status ? 'Show' : 'Hide'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 space-x-2">
                                        <Link to={`/library/flashcard/${set.id}/play`}
                                            state={{ from: 'manageflashcard' }}>
                                            <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm">View</button>
                                        </Link>
                                        <Link to={`/library/flashcard/edit/${set.id}`}
                                            state={{ from: 'manageflashcard' }}>
                                            <button className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 shadow-sm">Edit</button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(set.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">
                                        No flashcard sets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FlashcardList;
