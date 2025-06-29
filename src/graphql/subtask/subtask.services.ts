import {
  type CreateSubtaskInput,
  type Subtask,
  type UpdateSubtaskInput,
} from "generated/gql/graphql";
import { subtaskRepository } from "~/server/repositories/subtask.repository";
import { findJobAndVerifyManageAccess } from "../job/job.services";
import { SubtaskNotFoundError } from "./subtask.errors";

export async function getSubtasksByJobId({
  jobId,
  userId,
}: {
  jobId: string;
  userId: string;
}): Promise<Subtask[]> {
  return subtaskRepository.findManyByJobId(jobId, userId);
}

export async function getSubtaskById({
  subtaskId,
  jobId,
  userId,
}: {
  subtaskId: string;
  jobId: string;
  userId: string;
}): Promise<Subtask> {
  const subtask = await subtaskRepository.findByIdAndJobId({
    subtaskId,
    jobId,
    userId,
  });

  if (!subtask) {
    throw SubtaskNotFoundError();
  }

  return subtask;
}

export async function createSubtask({
  userId,
  input,
}: {
  userId: string;
  input: CreateSubtaskInput;
}): Promise<Subtask> {
  await findJobAndVerifyManageAccess({ userId, jobId: input.jobId });

  return subtaskRepository.create({
    description: input.description,
    deadline: input.deadline ?? null,
    cost: input.cost,
    jobId: input.jobId,
    status: input.status,
  });
}

export async function updateSubtask({
  userId,
  jobId,
  subtaskId,
  input,
}: {
  jobId: string;
  userId: string;
  subtaskId: string;
  input: UpdateSubtaskInput;
}): Promise<Subtask> {
  await findJobAndVerifyManageAccess({ userId, jobId });

  return subtaskRepository.updateByIdAndJobId(jobId, subtaskId, {
    deadline: input.deadline,
    description: input.description ?? undefined,
    cost: input.cost ?? undefined,
    status: input.status ?? undefined,
  });
}

export async function deleteSubtask({
  userId,
  jobId,
  subtaskId,
}: {
  userId: string;
  subtaskId: string;
  jobId: string;
}): Promise<string> {
  await findJobAndVerifyManageAccess({ userId, jobId });

  await subtaskRepository.softDeleteByIdAndJobId(jobId, subtaskId);
  return subtaskId;
}
