import { type Subtask, SubtaskStatus } from "generated/gql/graphql";
import { useState } from "react";
import FormActions from "~/components/ui/forms/form-actions/form-actions";
import FormError from "~/components/ui/forms/form-error/form-error";
import SelectField from "~/components/ui/forms/select-field/select-field";
import TextField from "~/components/ui/forms/text-field/text-field";
import { formatDateForInput, parseDateFromInput } from "~/lib/date";
import { extractGraphQLErrorMessage } from "~/lib/graphql-error";
import { SUBTASK_STATUS_OPTIONS } from "../../constants/subtask-status-map";
import {
  createSubtaskSchema,
  type CreateSubtaskFormData,
} from "../../schemas/create-subtask-schema";
import styles from "./subtask-form.module.css";

interface SubtaskFormProps {
  subtask?: Subtask;
  onSubmit: (data: {
    description: string;
    deadline?: Date;
    cost: number;
    status: SubtaskStatus;
  }) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  submitButtonText?: string;
  loadingText?: string;
}

export default function SubtaskForm({
  subtask,
  onSubmit,
  onCancel,
  loading = false,
  error = "",
  submitButtonText = "Create Subtask",
  loadingText = "Creating Subtask...",
}: SubtaskFormProps) {
  const [formError, setFormError] = useState<string>(error);
  const [formData, setFormData] = useState<CreateSubtaskFormData>({
    description: subtask?.description || "",
    cost: subtask?.cost || 0,
    deadline: subtask?.deadline || undefined,
    status: subtask?.status || SubtaskStatus.Pending,
  });

  const handleInputChange =
    (name: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setFormData((prev: CreateSubtaskFormData) => ({
        ...prev,
        [name]: e.target.value,
      }));
      setFormError("");
    };

  const handleCostChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setFormError("Cost must be a number");
      return;
    }

    setFormData((prev: CreateSubtaskFormData) => ({
      ...prev,
      cost: value,
    }));
    setFormError("");
  };

  const handleDeadlineChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const dateString = e.target.value;
    const date = parseDateFromInput(dateString);

    setFormData((prev: CreateSubtaskFormData) => ({
      ...prev,
      deadline: date || undefined,
    }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const validationResult = createSubtaskSchema.safeParse(formData);
    if (validationResult.success === false) {
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
      setFormError(extractGraphQLErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fields}>
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange("description")}
          placeholder="Enter subtask description"
          required
          multiline
        />

        <TextField
          label="Cost"
          name="cost"
          type="number"
          value={formData.cost.toString()}
          onChange={handleCostChange}
          placeholder="0.00"
          required
        />

        <TextField
          label="Deadline"
          name="deadline"
          type="date"
          value={formData.deadline ? formatDateForInput(formData.deadline) : ""}
          onChange={handleDeadlineChange}
        />

        <SelectField
          label="Status"
          name="status"
          value={formData.status || SubtaskStatus.Pending}
          onChange={handleInputChange("status")}
          options={[...SUBTASK_STATUS_OPTIONS]}
          disabled={loading}
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
