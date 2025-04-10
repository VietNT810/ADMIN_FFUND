import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all projects
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects.');
    }
  }
);

// Get project by ID
export const getProjectById = createAsyncThunk(
  'project/getProjectById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/project/get-by-id/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project by ID.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project documents.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project update posts.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project phases.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project milestones.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project story.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to approve project.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to reject project.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to suspend project.');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to complete project.');
    }
  }
);

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
      // Handling loading, success, and failure states for each async thunk
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      });
  },
});

export const { setProjects } = projectSlice.actions;

export default projectSlice.reducer;
