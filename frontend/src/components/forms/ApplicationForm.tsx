import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { STATUS_ORDER, STATUS_LABELS } from "../../constants/statuses";
import { useCreateApplication, useUpdateApplication } from "../../hooks/useApplications";
import type { JobApplication } from "../../types/application";

const schema = z
  .object({
    company: z.string().min(1, "Company is required"),
    position: z.string().min(1, "Position is required"),
    location: z.string().optional(),
    jobUrl: z.string().optional(),
    status: z.enum([
      "applied",
      "phone_screen",
      "technical_interview",
      "final_interview",
      "offer",
      "rejected",
      "withdrawn",
    ]),
    appliedDate: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
    contactPerson: z.string().optional(),
    salaryMin: z.number().int().min(0).nullable().optional(),
    salaryMax: z.number().int().min(0).nullable().optional(),
  })
  .refine(
    (d) =>
      d.salaryMin == null ||
      d.salaryMax == null ||
      d.salaryMin <= d.salaryMax,
    { message: "Min salary must be ≤ max", path: ["salaryMax"] }
  );

type FormValues = z.infer<typeof schema>;

interface ApplicationFormProps {
  onClose: () => void;
  initial?: JobApplication;
}

function inputClass(error?: boolean) {
  return `w-full rounded-lg px-3 py-2 text-sm bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
    error ? "border-red-500" : "border-gray-700"
  }`;
}

export function ApplicationForm({ onClose, initial }: ApplicationFormProps) {
  const create = useCreateApplication();
  const update = useUpdateApplication();
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          company: initial.company,
          position: initial.position,
          location: initial.location,
          jobUrl: initial.jobUrl,
          status: initial.status,
          appliedDate: initial.appliedDate.slice(0, 10),
          notes: initial.notes,
          contactPerson: initial.contactPerson,
          salaryMin: initial.salaryMin ?? undefined,
          salaryMax: initial.salaryMax ?? undefined,
        }
      : {
          status: "applied",
          appliedDate: new Date().toISOString().slice(0, 10),
        },
  });

  const onSubmit = handleSubmit(async (values: FormValues) => {
    const input = {
      company: values.company,
      position: values.position,
      location: values.location ?? "",
      jobUrl: values.jobUrl ?? "",
      status: values.status,
      appliedDate: new Date(values.appliedDate).toISOString(),
      notes: values.notes ?? "",
      contactPerson: values.contactPerson ?? "",
      salaryMin: values.salaryMin ?? null,
      salaryMax: values.salaryMax ?? null,
    };

    if (isEdit && initial) {
      await update.mutateAsync({ id: initial.id, input });
    } else {
      await create.mutateAsync(input);
    }
    onClose();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? "Edit Application" : "Add Application"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Company *
              </label>
              <input
                {...register("company")}
                className={inputClass(!!errors.company)}
                placeholder="Acme Corp"
              />
              {errors.company && (
                <p className="text-xs text-red-400 mt-1">{errors.company.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Position *
              </label>
              <input
                {...register("position")}
                className={inputClass(!!errors.position)}
                placeholder="Software Engineer"
              />
              {errors.position && (
                <p className="text-xs text-red-400 mt-1">{errors.position.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Status *
              </label>
              <select {...register("status")} className={inputClass(!!errors.status)}>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Applied Date *
              </label>
              <input
                type="date"
                {...register("appliedDate")}
                className={inputClass(!!errors.appliedDate)}
              />
              {errors.appliedDate && (
                <p className="text-xs text-red-400 mt-1">{errors.appliedDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Location
              </label>
              <input
                {...register("location")}
                className={inputClass()}
                placeholder="Remote / Istanbul"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Contact Person
              </label>
              <input
                {...register("contactPerson")}
                className={inputClass()}
                placeholder="Jane Doe (HR)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Job URL
            </label>
            <input
              {...register("jobUrl")}
              className={inputClass()}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Min Salary ($)
              </label>
              <input
                type="number"
                {...register("salaryMin", { valueAsNumber: true, setValueAs: (v) => (v === "" || isNaN(v) ? null : Number(v)) })}
                className={inputClass()}
                placeholder="60000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Max Salary ($)
              </label>
              <input
                type="number"
                {...register("salaryMax", { valueAsNumber: true, setValueAs: (v) => (v === "" || isNaN(v) ? null : Number(v)) })}
                className={inputClass(!!errors.salaryMax)}
                placeholder="90000"
              />
              {errors.salaryMax && (
                <p className="text-xs text-red-400 mt-1">{errors.salaryMax.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className={inputClass()}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? isEdit
                  ? "Saving..."
                  : "Adding..."
                : isEdit
                ? "Save Changes"
                : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
