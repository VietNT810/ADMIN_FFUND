import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { fetchGlobalSettingsByType } from '../../globalSetting/components/globalSettingSlice';

const PendingApprovalPanel = ({
    displayEvaluations,
    evaluationItems,
    selectedEvaluation,
    setSelectedEvaluation,
    comment,
    setComment,
    handleScoreChange,
    handleCommentSave,
    submitFinalEvaluation,
    areAllEvaluationsScored,
    totalPoints,
    maxPoints,
    dispatch,
    getEvaluationItems
}) => {

    const [thresholds, setThresholds] = useState({
        pass: 70,
        resubmit: 30,
        excellent: 90
    });

    const scrollContainerRef = useRef(null);
    const lastClickedItemRef = useRef(null);
    const lastScrollPositionRef = useRef(0);
    const isRestoringPositionRef = useRef(false);

    const itemIdsRef = useRef([]);
    const globalSettings = useSelector(state => state.globalSettings.settings);

    const currentItemIds = useMemo(() => {
        return evaluationItems.map(item => item.id);
    }, [evaluationItems]);

    useEffect(() => {
        itemIdsRef.current = currentItemIds;
    }, [currentItemIds]);

    useEffect(() => {
        const thresholdTypes = ['PASS_PERCENTAGE', 'RESUBMIT_PERCENTAGE', 'PASS_EXCELLENT_PERCENTAGE'];
        dispatch(fetchGlobalSettingsByType(thresholdTypes));
    }, [dispatch]);

    useEffect(() => {
        if (globalSettings && globalSettings.length > 0) {
            const newThresholds = { ...thresholds };

            globalSettings.forEach(setting => {
                if (setting.type === 'PASS_PERCENTAGE') {
                    newThresholds.pass = parseFloat(setting.value) * 100;
                } else if (setting.type === 'RESUBMIT_PERCENTAGE') {
                    newThresholds.resubmit = parseFloat(setting.value) * 100;
                } else if (setting.type === 'PASS_EXCELLENT_PERCENTAGE') {
                    newThresholds.excellent = parseFloat(setting.value) * 100;
                }
            });

            setThresholds(newThresholds);
        }
    }, [globalSettings]);


    // Calculate scores for current component
    const currentEvaluationScore = useMemo(() => {
        if (!selectedEvaluation || !evaluationItems.length) {
            return { totalPoints: 0, maxPoints: 0, percentage: 0, color: 'bg-gray-300' };
        }

        const currentItems = evaluationItems.filter(item => item.evaluationId === selectedEvaluation);

        if (!currentItems.length) {
            return { totalPoints: 0, maxPoints: 0, percentage: 0, color: 'bg-gray-300' };
        }

        const evalTotalPoints = currentItems.reduce((sum, item) => sum + (Number(item.actualPoint) || 0), 0);
        const evalMaxPoints = currentItems.reduce((sum, item) => sum + (Number(item.maxPoint) || 0), 0);

        // Calculate percentage
        const percentage = evalMaxPoints > 0 ? (evalTotalPoints / evalMaxPoints) * 100 : 0;

        // Determine color based on percentage
        const color = percentage >= 80 ? 'bg-green-500' :
            percentage >= 60 ? 'bg-green-400' :
                percentage >= 40 ? 'bg-yellow-500' :
                    'bg-red-500';

        return {
            totalPoints: evalTotalPoints,
            maxPoints: evalMaxPoints,
            percentage,
            color
        };
    }, [selectedEvaluation, evaluationItems]);

    // Calculate overall scores from ALL evaluations
    const overallScore = useMemo(() => {
        // Get all actual points and max points from displayEvaluations
        const totalActual = displayEvaluations.reduce((sum, evaluation) =>
            sum + Number(evaluation.actualPoint || 0), 0);
        const totalMaximum = displayEvaluations.reduce((sum, evaluation) =>
            sum + Number(evaluation.maximumPoint || 0), 0);

        // Calculate percentage
        const percentage = totalMaximum > 0 ? (totalActual / totalMaximum) * 100 : 0;

        // Determine color based on percentage
        const color = percentage >= 80 ? 'bg-green-500' :
            percentage >= 60 ? 'bg-green-400' :
                percentage >= 40 ? 'bg-yellow-500' :
                    'bg-red-500';

        return {
            totalPoints: totalActual,
            maxPoints: totalMaximum,
            percentage,
            color
        };
    }, [displayEvaluations]);

    // Phục hồi vị trí cuộn sau khi re-render
    const restoreScrollPosition = useCallback(() => {
        if (isRestoringPositionRef.current) return;

        if (scrollContainerRef.current && lastScrollPositionRef.current > 0) {
            isRestoringPositionRef.current = true;

            // Sử dụng requestAnimationFrame để đảm bảo DOM đã cập nhật
            requestAnimationFrame(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = lastScrollPositionRef.current;

                    // Đợi thêm chút để đảm bảo scroll đã hoàn tất
                    setTimeout(() => {
                        isRestoringPositionRef.current = false;
                    }, 100);
                }
            });
        }
    }, []);

    // Kiểm tra khi evaluationItems thay đổi và phục hồi vị trí
    useEffect(() => {
        // Nếu đang chấm điểm, cần phục hồi vị trí
        if (lastClickedItemRef.current) {
            restoreScrollPosition();
        }
    }, [evaluationItems, restoreScrollPosition]);

    // Xử lý khi component mount/unmount hoặc selectedEvaluation thay đổi
    useEffect(() => {
        // Khi chọn evaluation mới, reset vị trí cuộn
        if (selectedEvaluation) {
            lastClickedItemRef.current = null;
            lastScrollPositionRef.current = 0;
        }

        return () => {
            // Lưu vị trí cuộn khi unmount
            if (scrollContainerRef.current) {
                lastScrollPositionRef.current = scrollContainerRef.current.scrollTop;
            }
        };
    }, [selectedEvaluation]);

    // Xử lý cuộn đến item khi item được chọn
    useEffect(() => {
        // Nếu có item vừa được chấm, highlight nó
        if (lastClickedItemRef.current && !isRestoringPositionRef.current) {
            const element = document.getElementById(`item-${lastClickedItemRef.current}`);
            if (element) {
                // Chỉ flash highlight, không scroll
                element.classList.add('flash-highlight');
                setTimeout(() => {
                    element.classList.remove('flash-highlight');
                }, 1000);
            }
        }
    }, [evaluationItems]);

    const generateScoreButtons = (item) => {
        const scoreOptions = [];
        const step = item.maxPoint <= 5 ? 0.5 : 1;

        for (let i = 0; i <= item.maxPoint; i += step) {
            if (i === Math.floor(i)) {
                scoreOptions.push(i);
            }
        }

        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {scoreOptions.map(score => (
                    <button
                        key={`${item.id}-${score}`}
                        type="button"
                        onClick={() => handleScoreWithPosition(item.id, score)}
                        className={`px-2 py-0.5 text-xs rounded-md transition-colors border 
                            ${item.actualPoint === score
                                ? 'bg-green-600 text-white border-green-700 font-medium'
                                : 'bg-white text-gray-700 border-green-200 hover:bg-green-50'}`}
                    >
                        {score}
                    </button>
                ))}
            </div>
        );
    };

    // Hàm xử lý chấm điểm có lưu và khôi phục vị trí
    const handleScoreWithPosition = (itemId, score) => {
        // Lưu vị trí cuộn hiện tại trước khi gọi API
        if (scrollContainerRef.current) {
            lastScrollPositionRef.current = scrollContainerRef.current.scrollTop;
        }

        // Lưu ID của item vừa được chấm điểm
        lastClickedItemRef.current = itemId;

        // Thực hiện chấm điểm (gọi API thông qua parent component)
        handleScoreChange(itemId, score);
    };

    const getProjectStatus = (percentage) => {
        if (percentage >= thresholds.excellent) {
            return { label: 'Potential Project', color: 'text-green-700 bg-green-50 border-green-100' };
        } else if (percentage >= thresholds.pass) {
            return { label: 'Pass', color: 'text-blue-700 bg-blue-50 border-blue-100' };
        } else if (percentage >= thresholds.resubmit) {
            return { label: 'Resubmit', color: 'text-yellow-700 bg-yellow-50 border-yellow-100' };
        } else {
            return { label: 'Reject', color: 'text-red-700 bg-red-50 border-red-100' };
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm">
            <style jsx>{`
                .flash-highlight {
                    animation: flash-border 1s ease-out;
                }
                
                @keyframes flash-border {
                    0%, 100% { border-color: #d1fae5; }
                    50% { border-color: #10b981; border-width: 2px; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
                }
            `}</style>

            {displayEvaluations.length > 0 ? (
                <>
                    {/* Component Selection Dropdown - Fixed Height */}
                    <div className="p-4 border-b border-gray-100">
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Select Component to Evaluate:</label>
                        <select
                            className="select select-bordered w-full bg-white focus:ring-opacity-50"
                            value={selectedEvaluation || ''}
                            onChange={(e) => {
                                const val = e.target.value ? Number(e.target.value) : null;

                                setSelectedEvaluation(val);
                                if (val) dispatch(getEvaluationItems(val));

                                // Reset các giá trị lưu vị trí khi chuyển component
                                lastClickedItemRef.current = null;
                                lastScrollPositionRef.current = 0;
                            }}
                        >
                            <option value="">Select a component</option>
                            {displayEvaluations.map(evaluation => (
                                <option key={evaluation.id} value={evaluation.id}>
                                    {evaluation.componentName || evaluation.typeName || `Component #${evaluation.id}`}
                                </option>
                            ))}
                        </select>
                        <div className="text-xs text-green-600 mt-1 font-medium">
                            {displayEvaluations.length} components available
                        </div>
                    </div>

                    {/* Evaluation Items with controlled scroll */}
                    {selectedEvaluation && (
                        <div className="flex-grow flex flex-col overflow-hidden">
                            {/* Main scrollable content area - Flexible height */}
                            <div
                                className="flex-grow overflow-y-auto"
                                ref={scrollContainerRef}
                                onScroll={() => {
                                    // Chỉ cập nhật vị trí khi không phải đang trong quá trình phục hồi
                                    if (!isRestoringPositionRef.current && scrollContainerRef.current) {
                                        lastScrollPositionRef.current = scrollContainerRef.current.scrollTop;
                                    }
                                }}
                            >
                                <div className="px-4 py-2 space-y-3">
                                    {evaluationItems.length > 0 ? (
                                        evaluationItems.map((item) => (
                                            <div
                                                key={item.id}
                                                id={`item-${item.id}`}
                                                className={`p-3 border rounded-md bg-white shadow-sm transition-all duration-200 ${lastClickedItemRef.current === item.id
                                                    ? 'border-green-300 ring-1 ring-green-200'
                                                    : 'border-gray-100 hover:border-green-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-2 gap-2">
                                                    <h3 className="font-medium text-gray-800 text-sm">{item.basicRequirement}</h3>
                                                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-md border border-green-100 whitespace-nowrap">
                                                        Max: {item.maxPoint} points
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-600 my-1.5 leading-relaxed border-l-2 border-gray-100 pl-2">
                                                    {item.evaluationCriteria}
                                                </p>

                                                <div className="mt-2">
                                                    <div className="flex justify-between items-center">
                                                        <div className="font-medium text-xs text-gray-700">Score:</div>
                                                        <div className="text-xs font-medium px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                                                            {item.actualPoint || 0}/{item.maxPoint} ({Math.round(((item.actualPoint || 0) / item.maxPoint) * 100)}%)
                                                        </div>
                                                    </div>

                                                    {/* Score buttons */}
                                                    {generateScoreButtons(item)}

                                                    <div className="mt-1.5">
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 rounded-full"
                                                                style={{ width: `${((item.actualPoint || 0) / item.maxPoint) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md border border-dashed border-gray-200">
                                            <div className="text-center">
                                                <div className="inline-block w-8 h-8 border-2 border-t-green-500 border-gray-200 rounded-full animate-spin mb-2"></div>
                                                <p className="text-xs text-gray-500">Loading evaluation criteria...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {evaluationItems.length > 0 && (
                                <>
                                    {/* Comment Section - Fixed position and height */}
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                        <label className="block text-xs font-medium mb-1.5 text-gray-700">Evaluation Comment:</label>
                                        <textarea
                                            className="textarea textarea-bordered w-full min-h-[60px] max-h-[60px] bg-white focus:border-green-500 text-sm"
                                            rows="2"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Add your evaluation comments..."
                                        ></textarea>
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                className="btn btn-sm bg-green-600 hover:bg-green-700 border-none text-white gap-1"
                                                onClick={() => {
                                                    // Lưu vị trí trước khi lưu comment
                                                    if (scrollContainerRef.current) {
                                                        lastScrollPositionRef.current = scrollContainerRef.current.scrollTop;
                                                    }
                                                    handleCommentSave();
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                                </svg>
                                                Save
                                            </button>
                                        </div>
                                    </div>

                                    {/* Score Summary Section - Fixed position and height */}
                                    <div className="p-3 bg-white-50 border-t border-green-100">
                                        <div className="space-y-1.5">
                                            {/* Overall score from all evaluations */}
                                            <div className="flex justify-between items-center pt-1">
                                                <div className="flex items-center">
                                                    <span className="text-xs font-medium text-gray-700">Overall Score:</span>
                                                    <div className="ml-2 text-xs font-bold text-green-700">
                                                        {overallScore.totalPoints.toFixed(1)}/{overallScore.maxPoints} ({Math.round(overallScore.percentage)}%)
                                                    </div>

                                                    <div className={`ml-2 px-2 py-0.5 text-xs rounded-md font-medium ${getProjectStatus(overallScore.percentage).color}`}>
                                                        {getProjectStatus(overallScore.percentage).label}
                                                    </div>
                                                </div>

                                                <button
                                                    className="btn btn-xs bg-green-600 hover:bg-green-700 border-none text-white gap-1"
                                                    onClick={submitFinalEvaluation}
                                                    disabled={!areAllEvaluationsScored()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                    </svg>
                                                    Submit Final Evaluation
                                                </button>
                                            </div>

                                            <div className="mt-1">
                                                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${overallScore.color} rounded-full transition-all duration-300`}
                                                        style={{ width: `${overallScore.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
                                                <div className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs border border-red-100 flex items-center">
                                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                                    Reject: &lt;{Math.round(thresholds.resubmit)}%
                                                </div>
                                                <div className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs border border-yellow-100 flex items-center">
                                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                                                    Resubmit: {Math.round(thresholds.resubmit)}-{Math.round(thresholds.pass) - 1}%
                                                </div>
                                                <div className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100 flex items-center">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                                    Pass: {Math.round(thresholds.pass)}-{Math.round(thresholds.excellent) - 1}%
                                                </div>
                                                <div className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs border border-green-100 flex items-center">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                                    Potential: ≥{Math.round(thresholds.excellent)}%
                                                </div>
                                            </div>

                                            {!areAllEvaluationsScored() && (
                                                <div className="mt-2 text-xs text-yellow-600 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1">
                                                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                    </svg>
                                                    All components must be scored before submitting final evaluation
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="p-4">
                    <div className="alert bg-green-50 border-green-100 text-gray-700">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 text-green-600 mr-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p className="text-sm">No evaluation components found for this project.</p>
                        </div>
                        <div className="mt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

PendingApprovalPanel.propTypes = {
    displayEvaluations: PropTypes.array.isRequired,
    evaluationItems: PropTypes.array.isRequired,
    selectedEvaluation: PropTypes.number,
    setSelectedEvaluation: PropTypes.func.isRequired,
    comment: PropTypes.string.isRequired,
    setComment: PropTypes.func.isRequired,
    handleScoreChange: PropTypes.func.isRequired,
    handleCommentSave: PropTypes.func.isRequired,
    submitFinalEvaluation: PropTypes.func.isRequired,
    areAllEvaluationsScored: PropTypes.func.isRequired,
    totalPoints: PropTypes.number.isRequired,
    maxPoints: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
    getEvaluationItems: PropTypes.func.isRequired,
};

export default PendingApprovalPanel;