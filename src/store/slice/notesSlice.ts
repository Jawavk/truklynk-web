import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { post, get, put } from '@/services/api/apiService';

interface MediaDetail {
  mediaDetailSno: number;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: string;
  contentType: string;
  mediaSize: number;
}

interface Document {
  mediaSno: number;
  mediaDetails: MediaDetail[];
}

interface Note {
    note_sno: number;
    title: string;
    content: string;
    customer_name: string;
    customer_phone: string;
    user_booking_sno: number | null;
    priority: string;
    status: string;
    created_date: string;
    updated_date: string;
    document: {
      mediaSno: number;
      mediaDetails: null | {
        mediaDetailSno: number;
        mediaUrl: string;
        thumbnailUrl: string | null;
        mediaType: string;
        contentType: string;
        mediaSize: number;
      }[];
    };
  }
  
  interface ApiResponse {
    data: Array<{
      getallnotes: Note[];
    }>;
  }
  
  // If you need to maintain the nested response structure
  interface NotesApiResponse {
    getnotes: Note[];
  }
  
  // Your Redux state should store just the array of notes
  interface NotesState {
    data: Note[]; // Store notes directly
    loading: boolean;
    error: string | null;
  }


interface CreateNotePayload {
  title: string;
  content: string;
  customerName: string;
  customerPhone: string;
  priority: string;
  status: string;
  userBookingSno?: number;
  documentSno: {
    mediaSno: number | null;
    containerName: string;
    deleteMediaList: number[];
    mediaList: {
      mediaUrl: string;
      contentType: string | undefined;
      mediaType: string;
      thumbnailUrl: string | null;
      mediaSize: number;
      isUploaded: boolean;
      azureId: string;
      documentType?: string;
      mediaDetailSno?: number | null;
    }[];
  };
}

interface UpdateNotePayload {
  noteSno: number;
  title: string;
  content: string;
  customerName: string;
  customerPhone: string;
  priority: string;
  status: string;
  userBookingSno?: number;
  documentSno: {
    mediaSno: number | null;
    containerName: string;
    deleteMediaList: number[];
    mediaList: {
      mediaUrl: string;
      contentType: string | undefined;
      mediaType: string;
      thumbnailUrl: string | null;
      mediaSize: number;
      isUploaded: boolean;
      azureId: string;
      documentType?: string;
      mediaDetailSno?: number | null;
    }[];
  };
}

interface UpdateNoteStatusPayload {
  note_sno: number;
  status: string;
}

interface DeleteNotePayload {
  note_sno: number;
  delete_reason: string;
}

export const fetchNotes = createAsyncThunk(
    'notes/fetchNotes',
    async (params: { noteSno?: number; status?: string; priority?: string }, { rejectWithValue }) => {
      try {
        const query = new URLSearchParams();
        if (params.noteSno) query.append('note_sno', String(params.noteSno));
        if (params.status) query.append('status', params.status);
        if (params.priority) query.append('priority', params.priority);
  
        const response = await get<ApiResponse>(`serviceproviders/getallnotes?${query.toString()}`);
        
        // Extract notes from the response
        const notes = response.data?.[0]?.getallnotes || [];
        return notes;
      } catch (error: any) {
        return rejectWithValue(error?.message || 'Failed to fetch notes');
      }
    }
  );
  
  

export const CreateNote = createAsyncThunk(
  'notes/createNote',
  async (payload: CreateNotePayload, { rejectWithValue }) => {
    try {
      const response = await post('serviceproviders/createnotes', payload);
      return response as Note;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create note');
    }
  }
);

export const UpdateNote = createAsyncThunk(
  'notes/updateNote',
  async (payload: UpdateNotePayload, { rejectWithValue }) => {
    try {
      const response = await put('serviceproviders/updatenotes', payload);
      return response as Note;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update note');
    }
  }
);

export const UpdateNoteStatus = createAsyncThunk(
  'notes/updateNoteStatus',
  async (payload: UpdateNoteStatusPayload, { rejectWithValue }) => {
    try {
      const response = await put('serviceproviders/updatenotestatus', payload);
      return response as Note;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update note status');
    }
  }
);

// export const DeleteNote = createAsyncThunk(
//   'notes/deleteNote',
//   async (payload: DeleteNotePayload, { rejectWithValue }) => {
//     try {
//       await del('serviceproviders/deletenotes', payload);
//       return { note_sno: payload.note_sno };
//     } catch (error: any) {
//       return rejectWithValue(error?.message || 'Failed to delete note');
//     }
//   }
// );

const notesSlice = createSlice({
    name: 'notes',
    initialState: {
      data: [] as Note[],
      loading: false,
      error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
      // fetchNotes
      builder
        .addCase(fetchNotes.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchNotes.fulfilled, (state, action) => {
          state.loading = false;
          // Extract notes from the response if needed
          state.data = action.payload; // Or action.payload.getnotes if using NotesApiResponse
        })
        .addCase(fetchNotes.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
  
      // CreateNote
      builder
        .addCase(CreateNote.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(CreateNote.fulfilled, (state, action) => {
          state.loading = false;
          state.data.push(action.payload);
        })
        .addCase(CreateNote.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
  
      // UpdateNote
      builder
        .addCase(UpdateNote.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(UpdateNote.fulfilled, (state, action) => {
          state.loading = false;
          const index = state.data.findIndex(note => note.note_sno === action.payload.note_sno);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
        })
        .addCase(UpdateNote.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
  
      // UpdateNoteStatus
      builder
        .addCase(UpdateNoteStatus.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(UpdateNoteStatus.fulfilled, (state, action) => {
          state.loading = false;
          const index = state.data.findIndex(note => note.note_sno === action.payload.note_sno);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
        })
        .addCase(UpdateNoteStatus.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
    },
  });

export default notesSlice.reducer;