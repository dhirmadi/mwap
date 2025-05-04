import { Types } from 'mongoose';
import { ProjectModel } from '@models-v2/project.model';
import { TenantModel } from '@models-v2/tenant.model';
import { CloudProviderModel } from '@models-v2/cloudProvider.model';
import { ProjectTypeModel } from '@models-v2/projectType.model';
import { 
  ProjectCreateSchema, 
  ProjectUpdateSchema, 
  AddMemberSchema, 
  UpdateMemberRoleSchema,
  PROJECT_ROLE_HIERARCHY,
  ProjectRole 
} from './schema';
import { AppError } from '@core-v2/errors/AppError';
import type { User } from '@models-v2/user.model';
import type { ProjectCreate, ProjectUpdate, AddMemberRequest, UpdateMemberRoleRequest } from './schema';

export class ProjectService {
  static async createProject(user: User, payload: ProjectCreate) {
    const validationResult = ProjectCreateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    // Verify tenant exists and user has access
    const tenant = await TenantModel.findOne({
      _id: payload.tenantId,
      ownerId: user._id,
      archived: false
    });

    if (!tenant) {
      throw AppError.forbidden('Not authorized to create projects for this tenant');
    }

    // Verify cloud provider exists
    const provider = await CloudProviderModel.findOne({
      providerId: payload.cloudProvider,
      archived: false
    });

    if (!provider) {
      throw AppError.badRequest('Invalid cloud provider');
    }

    // Verify project type exists
    const projectType = await ProjectTypeModel.findOne({
      projectTypeId: payload.projectTypeId,
      archived: false
    });

    if (!projectType) {
      throw AppError.badRequest('Invalid project type');
    }

    try {
      const project = new ProjectModel({
        ...payload,
        ownerId: user._id
      });
      await project.save();
      return project;
    } catch (error: any) {
      if (error.code === 11000) {
        throw AppError.badRequest('A project already exists with this folder in the tenant');
      }
      throw error;
    }
  }

  static async getProject(projectId: string) {
    const project = await ProjectModel.findById(projectId);
    
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    return project;
  }

  static async updateProject(projectId: string, payload: ProjectUpdate) {
    const validationResult = ProjectUpdateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId, archived: false },
      { ...payload, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      throw AppError.notFound('Project not found or archived');
    }

    return project;
  }

  static async archiveProject(projectId: string) {
    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId, archived: false },
      { archived: true, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      throw AppError.notFound('Project not found or already archived');
    }

    return project;
  }

  static async addMember(projectId: string, currentUser: User, payload: AddMemberRequest) {
    // Validate input
    const validationResult = AddMemberSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    // Get project and verify it exists
    const project = await ProjectModel.findOne({ _id: projectId, archived: false });
    if (!project) {
      throw AppError.notFound('Project not found or archived');
    }

    // Get current user's role
    const currentMember = project.members.find(m => m.userId === currentUser._id);
    if (!currentMember || !['OWNER', 'DEPUTY'].includes(currentMember.role)) {
      throw AppError.forbidden('Only project owners and deputies can add members');
    }

    // Check role hierarchy
    const currentUserRoleLevel = PROJECT_ROLE_HIERARCHY[currentMember.role as ProjectRole];
    const newRoleLevel = PROJECT_ROLE_HIERARCHY[payload.role];

    if (newRoleLevel >= currentUserRoleLevel) {
      throw AppError.forbidden('Cannot assign a role equal to or higher than your own');
    }

    // Check if user is already a member
    if (project.members.some(m => m.userId === payload.userId)) {
      throw AppError.badRequest('User is already a member of this project');
    }

    // Add member
    const newMember = {
      userId: payload.userId,
      role: payload.role,
      joinedAt: new Date().toISOString()
    };

    project.members.push(newMember);
    await project.save();

    return newMember;
  }

  static async removeMember(projectId: string, currentUser: User, targetUserId: string) {
    // Get project and verify it exists
    const project = await ProjectModel.findOne({ _id: projectId, archived: false });
    if (!project) {
      throw AppError.notFound('Project not found or archived');
    }

    // Get current user's role
    const currentMember = project.members.find(m => m.userId === currentUser._id);
    if (!currentMember || !['OWNER', 'DEPUTY'].includes(currentMember.role)) {
      throw AppError.forbidden('Only project owners and deputies can remove members');
    }

    // Cannot remove self
    if (currentUser._id === targetUserId) {
      throw AppError.forbidden('Cannot remove yourself from the project');
    }

    // Get target member
    const targetMember = project.members.find(m => m.userId === targetUserId);
    if (!targetMember) {
      throw AppError.notFound('Member not found in project');
    }

    // Check role hierarchy
    const currentUserRoleLevel = PROJECT_ROLE_HIERARCHY[currentMember.role as ProjectRole];
    const targetRoleLevel = PROJECT_ROLE_HIERARCHY[targetMember.role as ProjectRole];

    if (targetRoleLevel >= currentUserRoleLevel) {
      throw AppError.forbidden('Cannot remove a member with equal or higher role');
    }

    // Remove member
    project.members = project.members.filter(m => m.userId !== targetUserId);
    await project.save();
  }

  static async updateMemberRole(projectId: string, currentUser: User, targetUserId: string, payload: UpdateMemberRoleRequest) {
    // Validate input
    const validationResult = UpdateMemberRoleSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    // Get project and verify it exists
    const project = await ProjectModel.findOne({ _id: projectId, archived: false });
    if (!project) {
      throw AppError.notFound('Project not found or archived');
    }

    // Get current user's role
    const currentMember = project.members.find(m => m.userId === currentUser._id);
    if (!currentMember || !['OWNER', 'DEPUTY'].includes(currentMember.role)) {
      throw AppError.forbidden('Only project owners and deputies can modify roles');
    }

    // Cannot modify own role
    if (currentUser._id === targetUserId) {
      throw AppError.forbidden('Cannot modify your own role');
    }

    // Get target member
    const targetMember = project.members.find(m => m.userId === targetUserId);
    if (!targetMember) {
      throw AppError.notFound('Member not found in project');
    }

    // Check role hierarchy for current role
    const currentUserRoleLevel = PROJECT_ROLE_HIERARCHY[currentMember.role as ProjectRole];
    const targetCurrentRoleLevel = PROJECT_ROLE_HIERARCHY[targetMember.role as ProjectRole];
    const targetNewRoleLevel = PROJECT_ROLE_HIERARCHY[payload.role];

    // Cannot modify role of someone with equal or higher role
    if (targetCurrentRoleLevel >= currentUserRoleLevel) {
      throw AppError.forbidden('Cannot modify role of a member with equal or higher role');
    }

    // Cannot assign role equal or higher than own
    if (targetNewRoleLevel >= currentUserRoleLevel) {
      throw AppError.forbidden('Cannot assign a role equal to or higher than your own');
    }

    // Update role
    targetMember.role = payload.role;
    await project.save();

    return targetMember;
  }
}