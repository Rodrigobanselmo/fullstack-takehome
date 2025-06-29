import { JobStatus } from "generated/gql/graphql";
import { useState } from "react";
import FormActions from "~/components/ui/forms/form-actions/form-actions";
import FormError from "~/components/ui/forms/form-error/form-error";
import SelectField from "~/components/ui/forms/select-field/select-field";
import TextField from "~/components/ui/forms/text-field/text-field";
import { useQueryHomeowners } from "../../api/use-query-homeowners";
import { JOB_STATUS_OPTIONS } from "../../constants/job-status-map";
import {
  createJobSchema,
  type CreateJobFormData,
} from "../../schemas/create-job-schema";
import styles from "./job-form.module.css";

export interface JobFormProps {
  initialData?: CreateJobFormData;
  loading?: boolean;
  error?: string;
  onSubmit: (data: CreateJobFormData) => Promise<void>;
  submitButtonText?: string;
  loadingText?: string;
  onCancel?: () => void;
}

const initialJobData = {
  description: "",
  location: "",
  status: JobStatus.Planning,
  cost: "",
  homeownerId: "",
};

export default function JobForm({
  initialData = initialJobData,
  loading = false,
  error = "",
  onSubmit,
  submitButtonText = "Create Job",
  loadingText = "Creating Job...",
  onCancel,
}: JobFormProps) {
  const [formData, setFormData] = useState<CreateJobFormData>(initialData);
  const [formError, setFormError] = useState<string>(error);
  const { data, loading: homeownersLoading } = useQueryHomeowners();

  const handleInputChange =
    (name: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setFormData((prev: CreateJobFormData) => ({
        ...prev,
        [name]: e.target.value,
      }));
      setFormError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const validationResult = createJobSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      const message = firstError
        ? `${firstError.path.join(".")}: ${firstError.message}`
        : "Validation failed";

      setFormError(message);
      return;
    }

    try {
      await onSubmit(validationResult.data);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to create job",
      );
    }
  };

  const homeownerOptions =
    data?.homeowners?.map((homeowner) => ({
      value: homeowner.id,
      label: homeowner.name,
    })) ?? [];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange("description")}
          placeholder="Enter job description..."
          required={true}
          multiline={true}
          maxLines={3}
        />
        <TextField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleInputChange("location")}
          placeholder="Enter job location..."
          required={true}
        />
        <SelectField
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleInputChange("status")}
          options={JOB_STATUS_OPTIONS}
          placeholder="Select job status..."
          required={true}
        />
        <TextField
          label="Cost ($)"
          name="cost"
          type="number"
          value={formData.cost}
          onChange={handleInputChange("cost")}
          placeholder="Enter job cost..."
          required={true}
        />
        <SelectField
          label="Homeowner"
          name="homeownerId"
          value={formData.homeownerId ?? ""}
          onChange={handleInputChange("homeownerId")}
          options={homeownerOptions}
          placeholder="Select a homeowner..."
          required={true}
          disabled={homeownersLoading}
          clearable={true}
        />
      </div>
      <FormError error={formError} />
      <FormActions
        primaryAction={{
          text: loading ? loadingText : submitButtonText,
          variant: "fill",
          color: "primary",
          size: "lg",
          minWidth: "150px",
          loading: loading,
        }}
        secondaryAction={
          onCancel
            ? {
                text: "Cancel",
                onClick: onCancel,
                variant: "outline",
                color: "grey",
                size: "lg",
                minWidth: "150px",
              }
            : undefined
        }
      />
    </form>
  );
}
