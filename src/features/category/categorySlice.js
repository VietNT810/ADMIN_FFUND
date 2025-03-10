// categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// GET Categories with Subcategories from API
export const getCategoriesContent = createAsyncThunk(
    'category/getCategoriesContent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('http://103.162.15.61:8080/api/v1/category/get-all', {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `${localStorage.getItem('accessToken')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch categories and subcategories.');
            }
            const data = await response.json();
            return data.data;  // Dữ liệu bao gồm cả categories và subcategories
        } catch (error) {
            return rejectWithValue(error.message);  // Xử lý lỗi
        }
    }
);



// DELETE Category
export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://103.162.15.61:8080/api/v1/category/delete/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete category.');
            }
            return categoryId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// POST New Category
export const createCategory = createAsyncThunk(
    'category/createCategory',
    async (newCategory, { rejectWithValue }) => {
        try {
            // Đảm bảo không có `id` khi gửi request
            const formattedCategory = {
                categoryName: newCategory.categoryName,
                categoryDescription: newCategory.categoryDescription || "",
                subCategories: newCategory.subCategories.map(sub => ({
                    subCategoryName: sub.subCategoryName,
                    subCategoryDescription: sub.subCategoryDescription || ""
                }))
            };

            const response = await fetch('http://103.162.15.61:8080/api/v1/category/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(formattedCategory),
            });

            if (!response.ok) {
                throw new Error('Failed to create category.');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// PUT Update Category
export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async (updatedCategory, { rejectWithValue }) => {
        try {
            // Xóa `id` khỏi request body
            const formattedCategory = {
                categoryName: updatedCategory.categoryName,
                categoryDescription: updatedCategory.categoryDescription || "",
                subCategories: updatedCategory.subCategories?.map(sub => ({
                    subCategoryName: sub.subCategoryName,
                    subCategoryDescription: sub.subCategoryDescription || ""
                })) || []
            };

            const response = await fetch(`http://103.162.15.61:8080/api/v1/category/update/${updatedCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(formattedCategory),
            });

            if (!response.ok) {
                throw new Error('Failed to update category.');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const categorySlice = createSlice({
    name: 'category',
    initialState: {
        categories: [],
        subCategories: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCategoriesContent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getCategoriesContent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categories = action.payload;
            })
            .addCase(getCategoriesContent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(category => category.id !== action.payload);
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(category => category.id === action.payload.id);
                if (index >= 0) {
                    state.categories[index] = action.payload;
                }
            });
    },
});

export default categorySlice.reducer;
