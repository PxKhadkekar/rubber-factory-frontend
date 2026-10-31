import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../../api/axios";
import toast from "react-hot-toast";

const jobSchema = z.object({
  jobNumber: z.string().min(1, "Job number is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  rubberType: z.string().min(1, "Rubber type is required"),
  punchNumber: z.coerce.number().min(1).max(10),
  processType: z.enum(["COATING", "GRINDING"]),
  companyName: z.string().min(1, "Company name is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
});

function CreateJob() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      processType: "COATING",
    },
  });

  const onSubmit = async (data) => {
    try {
      await api.post("/jobs", data);
      toast.success("Job created successfully");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create job");
    }
  };

  const inputClass = (errorField) => 
    `mt-1.5 block w-full rounded-xl shadow-sm sm:text-sm py-3 px-4 border transition-all duration-200 ${
      errorField 
      ? "border-red-400 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-gray-900 dark:text-white focus:border-red-500 focus:ring-red-500" 
      : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-slate-600"
    }`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create New Job</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 font-medium">Enter the details below to register a new job into the factory system.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Identification */}
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/60 dark:to-slate-900">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 p-1.5 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
              </span>
              Identification Details
            </h3>
          </div>
          <div className="px-6 py-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            <div>
              <label htmlFor="jobNumber" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Job Number</label>
              <input type="text" id="jobNumber" placeholder="e.g. J-1029" {...register("jobNumber")} className={inputClass(errors.jobNumber)} />
              {errors.jobNumber && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.jobNumber.message}</p>}
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Company Name</label>
              <input type="text" id="companyName" placeholder="e.g. Acme Corp" {...register("companyName")} className={inputClass(errors.companyName)} />
              {errors.companyName && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.companyName.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="vehicleNumber" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Vehicle / Component Number</label>
              <input type="text" id="vehicleNumber" placeholder="e.g. MH-12-AB-1234" {...register("vehicleNumber")} className={inputClass(errors.vehicleNumber)} />
              {errors.vehicleNumber && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.vehicleNumber.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Technical Specifications */}
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/60 dark:to-slate-900">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
              <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 p-1.5 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </span>
              Technical Specifications
            </h3>
          </div>
          <div className="px-6 py-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            <div>
              <label htmlFor="processType" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Initial Process Type</label>
              <select id="processType" {...register("processType")} className={inputClass(errors.processType)}>
                <option value="COATING">Coating Pipeline</option>
                <option value="GRINDING">Grinding Pipeline</option>
              </select>
              {errors.processType && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.processType.message}</p>}
            </div>
            <div>
              <label htmlFor="rubberType" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Rubber Material Type</label>
              <input type="text" id="rubberType" placeholder="e.g. Nitrile" {...register("rubberType")} className={inputClass(errors.rubberType)} />
              {errors.rubberType && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.rubberType.message}</p>}
            </div>
            <div>
              <label htmlFor="punchNumber" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Punch Number (1-10)</label>
              <input type="number" id="punchNumber" placeholder="1" {...register("punchNumber")} className={inputClass(errors.punchNumber)} />
              {errors.punchNumber && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.punchNumber.message}</p>}
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Estimated Price (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-slate-400 sm:text-sm">₹</span>
                </div>
                <input type="number" id="price" placeholder="0.00" {...register("price")} className={`${inputClass(errors.price)} pl-8`} />
              </div>
              {errors.price && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.price.message}</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center items-center px-8 py-3 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transform hover:-translate-y-0.5 transition-all"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Job...
              </>
            ) : "Create New Job"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateJob;
