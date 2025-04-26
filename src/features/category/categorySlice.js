import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// GET Categories with Subcategories from API
export const getCategoriesContent = createAsyncThunk(
    'category/getCategoriesContent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('https://quanbeo.duckdns.org/api/v1/category/all');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories and subcategories.');
        }
    }
);

// Enabled Category
export const enableCategory = createAsyncThunk(
    'category/enableCategory', 
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`https://quanbeo.duckdns.org/api/v1/category/enable/${categoryId}`);
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to enable category.');
        } 
    }
);

// De-active Category
export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`https://quanbeo.duckdns.org/api/v1/category/delete/${categoryId}`);
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to delete category.');
        }
    }
);

// POST New Category
export const createCategory = createAsyncThunk(
    'category/createCategory',
    async (newCategory, { rejectWithValue }) => {
        try {
            const formattedCategory = {
                categoryName: newCategory.categoryName,
                categoryDescription: newCategory.categoryDescription || '',
                subCategories: newCategory.subCategories.map(sub => ({
                    subCategoryName: sub.subCategoryName,
                    subCategoryDescription: sub.subCategoryDescription || ''
                }))
            };

            const response = await axios.post('https://quanbeo.duckdns.org/api/v1/category/create', formattedCategory);

            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create category.');
        }
    }
);

// PUT Update Category
export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async (updatedCategory, { rejectWithValue }) => {
        try {
            const formattedCategory = {
                categoryName: updatedCategory.categoryName,
                categoryDescription: updatedCategory.categoryDescription,
            };

            const response = await axios.put(`https://quanbeo.duckdns.org/api/v1/category/update/${updatedCategory.id}`, formattedCategory);

            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update Category.');
        }
    }
);

// PUT Update SubCategory
export const updateSubCategory = createAsyncThunk(
    'category/updateSubCategory',
    async (updateSubCategory, { rejectWithValue }) => {
        try {
            const formattedCategory = {
                subCategoryName: updateSubCategory.subCategoryName,
                subCategoryDescription: updateSubCategory.subCategoryDescription,
            };

            const response = await axios.put(`https://quanbeo.duckdns.org/api/v1/category/sub/${updateSubCategory.id}`, formattedCategory);

            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update Subcategory.');
        }
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState: {
        categories: [],
        status: 'idle',
        error: null,
        enableStatus: '',
        deleteStatus: '',
    },
    reducers: {
        resetActiveStatus: (state) => {
            state.enableStatus = "";
            state.deleteStatus = "";
        },
        setCategories: (state, action) => {
            state.categories = action.payload; 
        },
        resetState: (state) => {
            state.categories = [];
            state.error = null;
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCategoriesContent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getCategoriesContent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categories = action.payload.map(category => ({
                    id: category.id,
                    categoryName: category.name,
                    categoryDescription: category.description,
                    subCategories: category.subCategories.map(sub => ({
                        subCategoryName: sub.name,
                        subCategoryDescription: sub.description
                    })),
                    active: category.active
                }));
            })
            .addCase(getCategoriesContent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            //de-active
            .addCase(deleteCategory.pending, (state) => {
                state.deleteStatus = 'loading';
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.deleteStatus = action.payload;
                state.categories = state.categories.map((category) => 
                    category.id === action.payload.id ? { ...category, active: false } : category
                );
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.deleteStatus = 'failed';
                state.error = `Error: ${action.payload}`;
            })
            //enable
            .addCase(enableCategory.pending, (state) => {
                state.enableStatus = 'loading';
            })
            .addCase(enableCategory.fulfilled, (state, action) => {
                state.enableStatus = action.payload;
                state.categories = state.categories.map((category) =>
                    category.id === action.payload.id ? { ...category, active: true } : category
                );
            })
            .addCase(enableCategory.rejected, (state, action) => {
                state.enableStatus = 'failed';
                state.error = `Error: ${action.payload}`;
            })
            //create
            .addCase(createCategory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Update Category
            .addCase(updateCategory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(category => category.id === action.payload.id);
                if (index >= 0) {
                    state.categories[index] = {
                        ...state.categories[index],
                        categoryName: action.payload.categoryName,
                        categoryDescription: action.payload.categoryDescription,
                    };
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Update Subcategory
            .addCase(updateSubCategory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateSubCategory.fulfilled, (state, action) => {
                const categoryIndex = state.categories.findIndex(category => category.id === action.payload.categoryId);
                if (categoryIndex >= 0) {
                    const subCategoryIndex = state.categories[categoryIndex].subCategories.findIndex(sub => sub.id === action.payload.subCategoryId);
                    if (subCategoryIndex >= 0) {
                        state.categories[categoryIndex].subCategories[subCategoryIndex] = {
                            ...state.categories[categoryIndex].subCategories[subCategoryIndex],
                            subCategoryName: action.payload.subCategoryName,
                            subCategoryDescription: action.payload.subCategoryDescription,
                        };
                    }
                }
            })
            .addCase(updateSubCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { resetActiveStatus, setCategories, resetState } = categorySlice.actions;

export default categorySlice.reducer;
