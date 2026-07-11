import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ManagerAttendance() {

    const [records,setRecords]=useState([]);
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        fetchAttendance();
    },[]);
    async function fetchAttendance(){
        try{
            const res=await API.get("/attendance/manager");
            setRecords(res.data);
        }catch(err){
            console.error(err);
        }finally{
            setLoading(false);
        }
    }
    return(
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">
                Attendance
            </h1>
            <div className="overflow-auto rounded-lg border bg-white">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
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
                        {!loading && records.length===0 &&(
                            <tr>
                                <td
                                    colSpan="5"
                                    className="p-5 text-center"
                                >
                                    No attendance found.
                                </td>
                            </tr>
                        )}
                        {!loading && records.map(record=>(
                            <tr
                                key={record._id}
                                className="border-t hover:bg-gray-50"
                            >
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
                                    {record.status==="Checked In"
                                        ? "🟢 Working"
                                        : "✅ Completed"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}