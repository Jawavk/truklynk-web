import React, { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Download, Eye, FileText, PencilLine, Trash2, Plus, Search, Filter, MoreVertical, Calendar, User, Phone, AlertCircle, CheckCircle, Clock, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/layout/Modal';
import { Button } from '@/components/ui/button';
import { fetchNotes, UpdateNoteStatus } from '@/store/slice/notesSlice';
import type { AppDispatch, RootState } from '@/store/store';

interface Note {
    note_sno: number;
    title: string;
    content: string;
    customer_name: string;
    customer_phone: string;
    priority: string;
    status: string;
    created_date: string;
    updated_date: string;
    user_booking_sno?: number | null;
    document: {
      mediaSno: number;
      mediaDetails: {
        mediaDetailSno: number;
        mediaUrl: string;
        thumbnailUrl: string | null;
        mediaType: string;
        contentType: string;
        mediaSize: number;
      }[] | null;
    } | null;
}

export default function NotesInformation() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: notesData, loading, error } = useSelector((state: RootState) => state.notes);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedNoteSno, setSelectedNoteSno] = useState<number | null>(null);
  const [noteToView, setNoteToView] = useState<Note | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const methods = useForm({
    defaultValues: {
      search: '',
      status: 'all',
      priority: 'all',
    },
  });

  useEffect(() => {
    dispatch(fetchNotes({}));
  }, [dispatch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const notesList = notesData || [];
  const totalNotes = notesList.length;
  const completedCount = notesList.filter(note => note.status === 'completed').length;
  const pendingCount = notesList.filter(note => note.status === 'pending').length;
  const inProgressCount = notesList.filter(note => note.status === 'in_progress').length;

  const filteredNotes = notesList.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || note.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEditNote = (note: Note) => {
    navigate('/noteAddDetails', {
      state: {
        note,
        editMode: true,
      },
    });
  };

  const handleViewClick = (note: Note) => {
    setNoteToView(note);
    setShowViewModal(true);
  };

  const handleDelete = (note: Note) => {
    setSelectedNoteSno(note.note_sno);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedNoteSno && deleteReason.trim()) {
      setShowDeleteModal(false);
      setDeleteReason('');
      setSelectedNoteSno(null);
    }
  };

  const handleStatusUpdate = (noteId: number, newStatus: string) => {
    dispatch(UpdateNoteStatus({ note_sno: noteId, status: newStatus }))
      .unwrap()
      .then(() => {
        dispatch(fetchNotes({}));
      })
      .catch((err) => {
        console.error('Status update failed:', err);
      });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ArrowUp className="h-4 w-4" />;
      case 'medium': return <ArrowRight className="h-4 w-4" />;
      case 'low': return <ArrowDown className="h-4 w-4" />;
      default: return <ArrowRight className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatStatusText = (status: string) => {
    if (!status) return 'UNKNOWN';
    return status.replace('_', ' ').toUpperCase();
  };

  const formatPriorityText = (priority: string) => {
    if (!priority) return 'MEDIUM';
    return priority.toUpperCase();
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notes Management</h1>
              <p className="text-gray-400">Manage your customer notes and follow-ups</p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => navigate('/noteAddDetails')}
            >
              <Plus className="h-5 w-5" />
              {isMobile ? 'Add Note' : 'Create New Note'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { 
                title: 'Total Notes', 
                count: totalNotes, 
                icon: <FileText className="h-6 w-6" />,
                bgColor: 'bg-gray-800/50',
                iconBg: 'bg-blue-600'
              },
              { 
                title: 'Completed', 
                count: completedCount, 
                icon: <CheckCircle className="h-6 w-6" />,
                bgColor: 'bg-gray-800/50',
                iconBg: 'bg-emerald-600'
              },
              { 
                title: 'In Progress', 
                count: inProgressCount, 
                icon: <Clock className="h-6 w-6" />,
                bgColor: 'bg-gray-800/50',
                iconBg: 'bg-blue-600'
              },
              { 
                title: 'Pending', 
                count: pendingCount, 
                icon: <AlertCircle className="h-6 w-6" />,
                bgColor: 'bg-gray-800/50',
                iconBg: 'bg-amber-600'
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-2xl ${stat.bgColor} border border-gray-700/50 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.count}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg} text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notes, customers, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading notes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">Error: {error}</p>
              </div>
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div
                  key={note.note_sno}
                  className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                        {note.title || 'Untitled Note'}
                      </h3>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(note.status)}`}>
                          {getStatusIcon(note.status)}
                          {formatStatusText(note.status)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getPriorityColor(note.priority)}`}>
                          {getPriorityIcon(note.priority)}
                          {formatPriorityText(note.priority)}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {note.content || 'No content available'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="h-4 w-4" />
                      <span>{note.customer_name || 'Unknown Customer'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{note.customer_phone || 'No phone number'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(note.created_date)}</span>
                    </div>
                    {note.user_booking_sno && (
                      <div className="text-sm text-gray-400">
                        Booking #{note.user_booking_sno}
                      </div>
                    )}
                  </div>

                  {note.document?.mediaDetails && note.document.mediaDetails.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                      <FileText className="h-4 w-4" />
                      <span>{note.document.mediaDetails.length} document{note.document.mediaDetails.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-700/50">
                    <Button
                      onClick={() => handleViewClick(note)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleEditNote(note)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
                    >
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </Button>
                    {note.status !== 'completed' && (
                      <Button
                        onClick={() => handleStatusUpdate(note.note_sno, 'completed')}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {note.status !== 'completed' && (
                      <Button
                        onClick={() => handleDelete(note)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-12 max-w-md mx-auto">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filters, or create your first note.</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium mx-auto"
                  onClick={() => navigate('/noteAddDetails')}
                >
                  <Plus className="h-5 w-5" />
                  Create Note
                </Button>
              </div>
            </div>
          )}

          <Modal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            title="Note Details"
            type="info"
            size="2xl"
            closeOnOverlay={true}
            closeOnEscape={true}
          >
            <div className="bg-gray-800 p-6">
              {noteToView && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Title</label>
                      <p className="text-white text-lg">{noteToView.title || 'Untitled Note'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Customer</label>
                      <p className="text-white">{noteToView.customer_name || 'Unknown Customer'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Phone</label>
                      <p className="text-white">{noteToView.customer_phone || 'No phone number'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Booking #</label>
                      <p className="text-white">{noteToView.user_booking_sno || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Priority</label>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getPriorityColor(noteToView.priority)}`}>
                        {getPriorityIcon(noteToView.priority)}
                        {formatPriorityText(noteToView.priority)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Status</label>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(noteToView.status)}`}>
                        {getStatusIcon(noteToView.status)}
                        {formatStatusText(noteToView.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Content</label>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <p className="text-white whitespace-pre-wrap">{noteToView.content || 'No content available'}</p>
                    </div>
                  </div>

                  {noteToView.document?.mediaDetails && noteToView.document.mediaDetails.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-3 block">Documents</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {noteToView.document.mediaDetails.map((media, index) => (
                          <div key={index} className="bg-gray-700/50 rounded-xl p-4 flex flex-col items-center text-center">
                            <FileText className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-white text-sm font-medium mb-2">Document {index + 1}</p>
                            <p className="text-gray-400 text-xs mb-3">{(media.mediaSize / 1024 / 1024).toFixed(1)} MB</p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => window.open(media.mediaUrl, '_blank')}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              <Button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = media.mediaUrl;
                                  link.download = `document-${index + 1}`;
                                  link.click();
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-600/50 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-colors"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700/50">
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Created Date</label>
                      <p className="text-white">{formatDate(noteToView.created_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Updated Date</label>
                      <p className="text-white">{formatDate(noteToView.updated_date)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal>

          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Note"
            type="warning"
            size="lg"
            closeOnOverlay={true}
            closeOnEscape={true}
          >
            <div className="p-6">
              <p className="text-sm text-gray-300 mb-4">
                Are you sure you want to delete this note? Please provide a reason for deletion.
              </p>
              <textarea
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                rows={4}
                placeholder="Reason for deletion..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                aria-label="Deletion reason"
              />
              <div className="text-xs text-gray-400 mt-2 text-right">{deleteReason.length} characters</div>
            </div>
            <div className="p-6 bg-gray-800 border-t border-gray-700 flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors ${
                  !deleteReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!deleteReason.trim()}
              >
                Delete
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    </FormProvider>
  );
}