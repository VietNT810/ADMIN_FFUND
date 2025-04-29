import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveProject, rejectProject } from './components/projectSlice';
import { EyeIcon, CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ProjectAssign = () => {
  const dispatch = useDispatch();
  const { projects, status, error } = useSelector(state => state.project || { projects: [], error: null, status: 'idle' });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const reasonInputRef = useRef(null);


  const handleApprove = () => {
      dispatch(approveProject(selectedProjectId))
          .then((result) => {
            if(result.error) {
              toast.error(result.payload || "An error occurred while processing the project.");
            } else {
              setShowConfirmation(false);
              toast.success(result.payload);
              dispatch(getProjects({ query: 'status:eq:DRAFT', page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
            }
          })
          .catch(() => {
              toast.error('Failed to approve project.');
          });
    };

    const handleReject = () => {
        const reason = reasonInputRef.current.value.trim();
        if (reason) {
          dispatch(rejectProject({ projectId: selectedProjectId, reason }))
            .then(() => {
              setShowConfirmation(false);
              toast.success('Project rejected successfully!');
              dispatch(getProjects({ query: 'status:eq:DRAFT', page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
            })
            .catch(() => {
              toast.error('Failed to reject project.');
            });
        } else {
          alert("Rejection reason is required.");
        }
    }

    const confirmAction = (action, projectId) => {
        setActionType(action);
        setSelectedProjectId(projectId);
        setShowConfirmation(true);
      };
    
    const cancelAction = () => {
    setShowConfirmation(false);
    setSelectedProjectId(null);
    };

    if (status === 'loading') {
    return <Loading />;
    };
  return (
    <div>ProjectAssign</div>
  )
}

export default ProjectAssign