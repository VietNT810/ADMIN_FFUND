import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all projects ADMIN
export const getProjects = createAsyncThunk(
  'project/getProjects',
  async ({ query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get('https://quanbeo.duckdns.org/api/v1/project/get-all', {
        params: { query, page, size, sort: sortOrderSymbol }
      });

      return {
        projects: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects.');
    }
  }
);

// Fetch all projects
export const getProjectOfManager = createAsyncThunk(
  'project/getProjectOfManager',
  async ({ query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get('https://quanbeo.duckdns.org/api/v1/project/manager/get-all', {
        params: { query, page, size, sort: sortOrderSymbol }
      });

      return {
        projects: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects.');
    }
  }
);

// Fetch a project that is likely to be completed
export const getProjectToComplete = createAsyncThunk(
  'project/getProjectToComplete',
  async ({ title, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get('https://quanbeo.duckdns.org/api/v1/project/completed', {
        params: { title, page, size, sort: sortOrderSymbol }
      });

      return {
        projects: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects.');
    }
  }
);

// Get project by ID
export const getProjectById = createAsyncThunk(
  'project/getProjectById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/project/secured/${id}`);
      return response.data.data;
    } catch (error) {
      
      return rejectWithValue({
        status: error.response?.status || 'Unknown',
        message: error.response?.data?.error || 'Failed to fetch project by ID.'
      });
    }
  }
);

// Get documents by project ID
export const getDocumentByProjectId = createAsyncThunk(
  'project/getDocumentByProjectId',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/project-document/get-by-project-id/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project documents.');
    }
  }
);

// Get update posts by project ID
export const getUpdatePostByProjectId = createAsyncThunk(
  'project/getUpdatePostByProjectId',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/project-update-post/by-project-id/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project update posts.');
    }
  }
);

// Get phases by project ID
export const getPhaseByProjectId = createAsyncThunk(
  'project/getPhaseByProjectId',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/funding-phase/project/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project phases.');
    }
  }
);

// Get milestones by phase ID
export const getMilestoneByPhaseId = createAsyncThunk(
  'project/getMilestoneByPhaseId',
  async (phaseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/milestone/phase/${phaseId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project milestones.');
    }
  }
);

// Get story by project ID
export const getStoryByProjectId = createAsyncThunk(
  'project/getStoryByProjectId',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/project-story/project/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project story.');
    }
  }
);

// Assign manager to project
export const assignManagerToProject = createAsyncThunk(
  'project/assignManagerToProject',
  async ({ projectId, managerId }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://quanbeo.duckdns.org/api/v1/project/assign/${projectId}/manager/${managerId}`
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to assign manager to project.');
    }
  }
);

// Approve project
export const approveProject = createAsyncThunk(
  'project/approveProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `https://quanbeo.duckdns.org/api/v1/project/approve/${projectId}`
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to approve project.');
    }
  }
);

// Reject project
export const rejectProject = createAsyncThunk(
  'project/rejectProject',
  async ({ projectId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://quanbeo.duckdns.org/api/v1/project/reject/${projectId}`,
        { reason }
      );

      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reject project.');
    }
  }
);

// Suspend project
export const suspendProject = createAsyncThunk(
  'project/suspendProject',
  async ({ projectId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://quanbeo.duckdns.org/api/v1/project/suspend/${projectId}`,
        { reason }
      );

      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        `Failed to suspend project: ${error.message}`
      );
    }
  }
);

// Mark project as completed
export const completeProject = createAsyncThunk(
  'project/completeProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `https://quanbeo.duckdns.org/api/v1/project/completed/${projectId}`
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to complete project.');
    }
  }
);

export const getProjectStatistics = createAsyncThunk(
  'project/getProjectStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://quanbeo.duckdns.org/api/v1/project/statistics');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project statistics.');
    }
  }
);

// Fetch all projects MANAGER
export const getProjectsManager = createAsyncThunk(
  'project/getProjects',
  async ({ query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get('https://quanbeo.duckdns.org/api/v1/project/manager/get-all', {
        params: { query, page, size, sort: sortOrderSymbol }
      });

      return {
        projects: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects.');
    }
  }
);

export const getPhaseDocumentByPhaseId = createAsyncThunk(
  'phase-document/getPhaseDocumentByPhaseId',
  async (phaseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/phase-document/submitted/all/${phaseId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch phase documents.');
    }
  }
);

export const banViolationProject = createAsyncThunk(
  'project/banViolationProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://quanbeo.duckdns.org/api/v1/project/ban/violation/${projectId}`,
      );

      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to ban project for violation.');
    }
  }
)

export const banUnderReviewProject = createAsyncThunk(
  'project/banUnderReviewProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://quanbeo.duckdns.org/api/v1/project/ban/under-review/${projectId}`,
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to ban project under review.');
    }
  }
)

export const approveSuspendedProject = createAsyncThunk(
  'project/approveSuspendedProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://quanbeo.duckdns.org/api/v1/project/approve/suspended/${projectId}`,
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to approve suspended project.');
    }
  }
)

const formatErrorMessage = (error) => {
    if (!error) return "Unknown error";
    
    if (typeof error === 'string') return error;
    
    if (typeof error === 'object') {
        // Handle object with error properties
        if (error.description) return `Description: ${error.description}`;
        
        // Convert object to string representation
        return Object.entries(error)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    }
    
    return String(error);
};

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    currentProject: null,
    totalPages: 1,
    documents: [],
    updates: [],
    phases: [],
    milestones: {},
    story: null,
    statistics: null,
    assign: null,
    error: null,
    status: 'idle',
  },
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload.projects;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);
      })
      .addCase(getProjectOfManager.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getProjectOfManager.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload.projects;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getProjectOfManager.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(getProjectToComplete.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getProjectToComplete.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload.projects;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getProjectToComplete.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(getProjectById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProject = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);
      })
      .addCase(getStoryByProjectId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getStoryByProjectId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.story = action.payload;
      })
      .addCase(getStoryByProjectId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(getDocumentByProjectId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getDocumentByProjectId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents = action.payload;
      })
      .addCase(getDocumentByProjectId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(getUpdatePostByProjectId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getUpdatePostByProjectId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.updates = action.payload;
      })
      .addCase(getUpdatePostByProjectId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(getPhaseByProjectId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getPhaseByProjectId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.phases = action.payload;
      })
      .addCase(getPhaseByProjectId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(getMilestoneByPhaseId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getMilestoneByPhaseId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const phaseId = action.meta.arg;
        state.milestones = {
          ...state.milestones,
          [phaseId]: action.payload,
        };
      })
      .addCase(getMilestoneByPhaseId.rejected, (state, action) => {
        state.status = 'failed'; 
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(approveProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(approveProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(approveProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(suspendProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(suspendProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(suspendProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(rejectProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(rejectProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(rejectProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(completeProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(completeProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedProject = action.payload;
        state.projects = state.projects.map(project =>
          project.id === updatedProject.id ? updatedProject : project
        );
        state.currentProject = updatedProject;
      })
      .addCase(completeProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      // assign manager to project
      .addCase(assignManagerToProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(assignManagerToProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assign = action.payload;
      })
      .addCase(assignManagerToProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      // Handle getProjectStatistics
      .addCase(getProjectStatistics.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getProjectStatistics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.statistics = action.payload;
      })
      .addCase(getProjectStatistics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(getPhaseDocumentByPhaseId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getPhaseDocumentByPhaseId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents = action.payload;
      })
      .addCase(getPhaseDocumentByPhaseId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(banViolationProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(banViolationProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(banViolationProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(banUnderReviewProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(banUnderReviewProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(banUnderReviewProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      })
      .addCase(approveSuspendedProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(approveSuspendedProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(approveSuspendedProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = formatErrorMessage(action.payload);;
      });
  },
});

export const { setProjects } = projectSlice.actions;

export default projectSlice.reducer;
