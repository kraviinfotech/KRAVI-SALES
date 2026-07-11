import React, { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import * as XLSX from "xlsx";


export default function ManagerAttendance() {

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const rowsPerPage = 10;








    useEffect(() => {
        fetchAttendance();
    }, [search, selectedDate, currentPage]);
    async function fetchAttendance() {

        setLoading(true);

        try {

            const res = await API.get("/attendance/manager", {
                params: {
                    page: currentPage,
                    limit: rowsPerPage,
                    search,
                    date: selectedDate
                }
            });

            setRecords(res.data.records || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalRecords(res.data.totalRecords || 0);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }
    const exportToExcel = () => {

        const data = records.map(record => ({
            Date: record.date,
            Seller: record.sellerName,
            "Check In": record.checkInTime,
            "Check Out": record.checkOutTime,
            Hours: record.totalHours,
            Status: record.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Attendance"
        );

        XLSX.writeFile(
            workbook,
            "Attendance_Report.xlsx"
        );

    };
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">
                Attendance
            </h1>
            <div className="rounded-lg border bg-white">
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">


                    <input
                        type="text"
                        placeholder="Search seller..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 md:w-72 focus:border-slate-700 focus:outline-none" />

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="rounded-lg border px-4 py-2"
                    />
                    <div>
                        <button
                            onClick={exportToExcel}
                            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                        >
                            Export Excel
                        </button>
                    </div>

                </div>


                <div className="mb-3 text-sm text-slate-600">
                    Total Attendance : <strong>{totalRecords}</strong>
                </div>
                <div className="overflow-x-auto">

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">                            <tr>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Seller</th>
                            <th className="p-3 text-left">Check In</th>
                            <th className="p-3 text-left">Check Out</th>
                            <th className="p-3 text-left">Hours</th>
                            <th className="p-3 text-left">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-5 text-center"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            )}
                            {!loading && records.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-5 text-center"
                                    >
                                        No attendance found.
                                    </td>
                                </tr>
                            )}
                            {!loading && records.map(record => (
                                <tr
                                    key={record._id}
                                    className="border-b hover:bg-slate-50 transition"
                                >
                                    <td className="p-3">
                                        {record.date}
                                    </td>

                                    <td className="p-3">
                                        {record.sellerName}
                                    </td>

                                    <td className="p-3">
                                        {record.checkInTime}
                                    </td>
                                    <td className="p-3">
                                        {record.checkOutTime || "--"}
                                    </td>
                                    <td className="p-3">
                                        {record.totalHours}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${record.status === "Checked In"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6 flex items-center justify-center gap-3">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="rounded bg-slate-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages || 1}
                    </span>

                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="rounded bg-slate-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                        Next
                    </button>

                </div>
            </div>
        </div>
    );
}