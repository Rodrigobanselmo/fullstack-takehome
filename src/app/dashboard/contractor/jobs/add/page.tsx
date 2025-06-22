"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  CreateJobMutation,
  CreateJobMutationVariables,
  JobStatus,
} from "generated/gql/graphql";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormError from "~/components/ui/forms/form-error/form-error";
import SelectField from "~/components/ui/forms/select-field/select-field";
import SubmitButton from "~/components/ui/forms/submit-button/submit-button";
import TextField from "~/components/ui/forms/text-field/text-field";
import PageHeader from "~/components/ui/page-header/page-header";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

const CREATE_JOB_MUTATION = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      description
      location
      status
      cost
      contractorId
      homeownerId
    }
  }
`;

const JOB_STATUS_OPTIONS = [
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
];

export default function AddJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    status: "PLANNING" as JobStatus,
    cost: "",
    contractorId: "",
    homeownerId: "",
  });
  const [formError, setFormError] = useState("");

  const [createJob, { loading }] = useMutation<
    CreateJobMutation,
    CreateJobMutationVariables
  >(CREATE_JOB_MUTATION, {
    onCompleted: () => {
      router.push(paths.dashboard.contractor.getHref());
    },
    onError: (error) => {
      setFormError(error.message);
    },
  });

  const handleBack = () => {
    router.push(paths.dashboard.contractor.getHref());
  };

  const handleInputChange =
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [name]: e.target.value }));
      setFormError(""); // Clear error when user starts typing
    };

  const handleSelectChange =
    (name: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [name]: e.target.value }));
      setFormError(""); // Clear error when user starts typing
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.description.trim()) {
      setFormError("Description is required");
      return;
    }
    if (!formData.location.trim()) {
      setFormError("Location is required");
      return;
    }
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      setFormError("Cost must be a positive number");
      return;
    }
    if (!formData.contractorId.trim()) {
      setFormError("Contractor ID is required");
      return;
    }

    await createJob({
      variables: {
        input: {
          description: formData.description.trim(),
          location: formData.location.trim(),
          status: formData.status,
          cost: parseFloat(formData.cost),
          contractorId: formData.contractorId.trim(),
          homeownerId: formData.homeownerId.trim() || undefined,
        },
      },
    });
  };

  return (
    <div className={styles.main}>
      <PageHeader title="Add New Job" onBack={handleBack} />

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Job Details</h2>

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange("description")}
              placeholder="Enter job description..."
              required={true}
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
              onChange={handleSelectChange("status")}
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
            <TextField
              label="Homeowner ID (Optional)"
              name="homeownerId"
              value={formData.homeownerId}
              onChange={handleInputChange("homeownerId")}
              placeholder="Enter homeowner ID..."
              required={false}
            />
          </div>

          <FormError error={formError} />

          <div className={styles.formActions}>
            <SubmitButton isLoading={loading} disabled={loading}>
              {loading ? "Creating Job..." : "Create Job"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
