import {useQuery} from "@tanstack/react-query";
import { getApiMonitor } from "../../api/superAdminApi";

export default function SuperAdminApiMonitor(){
 const {data,isLoading,isError,error}=useQuery({queryKey:["api-monitor"],queryFn:getApiMonitor});
 if(isLoading) return <div className="p-8">Loading api-monitor...</div>;
 if(isError) return <div className="p-8 bg-red-50 text-red-700 rounded-xl">{error?.message||"Failed loading data"}</div>;
 return <main className="p-6 bg-gray-50 min-h-screen"><div className="bg-white rounded-2xl shadow border p-6">
 <h1 className="text-3xl font-bold">API Monitor</h1>
 <p className="mt-2 text-gray-600">Production data view connected to backend services.</p>
 <pre className="mt-6 overflow-auto bg-gray-100 p-4 rounded-xl text-sm">{JSON.stringify(data,null,2)}</pre>
 </div></main>
}
