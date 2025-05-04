import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getDocumentByProjectId } from '../projectmanager/components/projectSlice';
import Loading from '../../components/Loading';
import * as XLSX from 'xlsx';
import {
    DocumentIcon, DocumentTextIcon, DocumentChartBarIcon,
    PresentationChartBarIcon, TableCellsIcon, ChartPieIcon,
    DocumentMagnifyingGlassIcon, ClipboardDocumentListIcon,
    ChevronDownIcon, ChevronUpIcon, ArrowTopRightOnSquareIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const ProjectDetailsDocumentEvaluation = ({ getClassName }) => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const { documents, status, error } = useSelector(state => state.project);
    const [expandedDocId, setExpandedDocId] = useState(null);
    const [excelData, setExcelData] = useState(null);
    const [loadingExcel, setLoadingExcel] = useState(false);

    useEffect(() => {
        if (projectId) {
            dispatch(getDocumentByProjectId(projectId));
        }
    }, [dispatch, projectId]);

    // Reset excel data when closing document
    useEffect(() => {
        if (!expandedDocId) {
            setExcelData(null);
        }
    }, [expandedDocId]);

    if (status === 'loading') return <Loading />;
    if (status === 'failed') return <div className="alert alert-error">{error}</div>;

    // Get file extension from URL
    const getFileExtension = (url) => {
        if (!url) return '';
        const filename = url.split('/').pop();
        return filename.split('.').pop().toLowerCase();
    };

    // Get document icon based on file extension
    const getDocumentIcon = (url, type) => {
        const extension = getFileExtension(url);

        // Icon and color based on file extension
        switch (extension) {
            case 'pdf':
                return <DocumentTextIcon className="w-8 h-8 text-red-600" />;
            case 'doc':
            case 'docx':
                return <DocumentIcon className="w-8 h-8 text-blue-600" />;
            case 'xls':
            case 'xlsx':
                return <TableCellsIcon className="w-8 h-8 text-green-600" />;
            case 'ppt':
            case 'pptx':
                return <PresentationChartBarIcon className="w-8 h-8 text-orange-500" />;
            case 'csv':
                return <DocumentChartBarIcon className="w-8 h-8 text-purple-600" />;
            case 'txt':
                return <ClipboardDocumentListIcon className="w-8 h-8 text-gray-600" />;
            default:
                // Fallback to document type if extension is not recognized
                return getDocumentTypeIcon(type);
        }
    };

    // Get icon based on document type (fallback)
    const getDocumentTypeIcon = (type) => {
        switch (type) {
            case 'SWOT_ANALYSIS':
                return <ChartPieIcon className="w-8 h-8 text-purple-600" />;
            case 'BUSINESS_MODEL_CANVAS':
                return <DocumentChartBarIcon className="w-8 h-8 text-blue-600" />;
            case 'BUSINESS_PLAN':
                return <ClipboardDocumentListIcon className="w-8 h-8 text-indigo-600" />;
            case 'MARKET_RESEARCH':
                return <DocumentMagnifyingGlassIcon className="w-8 h-8 text-amber-600" />;
            case 'FINANCIAL_PLAN':
                return <TableCellsIcon className="w-8 h-8 text-emerald-600" />;
            default:
                return <DocumentIcon className="w-8 h-8 text-gray-600" />;
        }
    };

    const formatDocumentType = (type) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const formatFileName = (description) => {
        if (!description) return '';
        try {
            const decoded = decodeURIComponent(description);
            return decoded.replace(/^[\d_]+/g, '').substring(0, 60) + (decoded.length > 60 ? '...' : '');
        } catch (e) {
            return description.substring(0, 60) + (description.length > 60 ? '...' : '');
        }
    };

    const fetchExcelFile = async (url) => {
        try {
            setLoadingExcel(true);
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get the first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to HTML table
                const html = XLSX.utils.sheet_to_html(worksheet);

                // Get all available sheets for tabs
                const sheets = workbook.SheetNames.map(name => {
                    const sheet = workbook.Sheets[name];
                    return {
                        name,
                        html: XLSX.utils.sheet_to_html(sheet)
                    };
                });

                setExcelData({
                    currentSheet: firstSheetName,
                    sheets: sheets
                });
                setLoadingExcel(false);
            };

            reader.readAsArrayBuffer(blob);
        } catch (error) {
            console.error("Error loading Excel file:", error);
            setLoadingExcel(false);
        }
    };

    const toggleDocument = (docId, document) => {
        if (expandedDocId === docId) {
            setExpandedDocId(null); // close if already open
        } else {
            setExpandedDocId(docId); // open the clicked document

            // If it's an Excel file, fetch and parse it
            const extension = getFileExtension(document.documentUrl);
            if (['xls', 'xlsx', 'csv'].includes(extension)) {
                fetchExcelFile(document.documentUrl);
            }
        }
    };

    // Switch between Excel sheets
    const switchExcelSheet = (sheetName) => {
        if (!excelData) return;

        setExcelData(prev => ({
            ...prev,
            currentSheet: sheetName
        }));
    };

    // Render Excel preview component
    const renderExcelPreview = () => {
        if (loadingExcel) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            );
        }

        if (!excelData) return null;

        const currentSheetData = excelData.sheets.find(s => s.name === excelData.currentSheet);

        return (
            <div className="excel-preview">
                {/* Sheet tabs */}
                <div className="flex overflow-x-auto bg-gray-100 border-b border-gray-300">
                    {excelData.sheets.map(sheet => (
                        <button
                            key={sheet.name}
                            className={`px-4 py-2 text-sm whitespace-nowrap ${sheet.name === excelData.currentSheet
                                ? 'bg-white border-t-2 border-green-500 font-medium'
                                : 'hover:bg-gray-200'}`}
                            onClick={() => switchExcelSheet(sheet.name)}
                        >
                            {sheet.name}
                        </button>
                    ))}
                </div>

                {/* Sheet content */}
                <div className="excel-content overflow-auto max-h-96">
                    <div dangerouslySetInnerHTML={{ __html: currentSheetData.html }} />
                </div>
            </div>
        );
    };

    // Determine appropriate preview component based on file extension
    const renderPreview = (document) => {
        const extension = getFileExtension(document.documentUrl);

        switch (extension) {
            case 'pdf':
                return (
                    <iframe
                        src={`${document.documentUrl}#view=FitH`}
                        title={document.documentDescription}
                        className="w-full h-[600px] border-0"
                    ></iframe>
                );
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return (
                    <img
                        src={document.documentUrl}
                        alt={document.documentDescription}
                        className="max-w-full max-h-[600px] mx-auto"
                    />
                );
            case 'xls':
            case 'xlsx':
            case 'csv':
                return renderExcelPreview();
            default:
                // For other file types that can't be embedded
                return (
                    <div className="flex flex-col items-center justify-center p-10 bg-gray-100 rounded-lg">
                        {getDocumentIcon(document.documentUrl, document.documentType)}
                        <p className="mt-4 text-gray-600">
                            This file type cannot be previewed directly.
                            <a
                                href={document.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-orange-500 hover:underline inline-flex items-center"
                            >
                                Open externally <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                            </a>
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className={`${getClassName?.("pills-document")} p-6 bg-base-100 shadow-xl rounded-lg`} id="pills-document" role="tabpanel">
            <h2 className="text-2xl font-semibold text-orange-600 mb-6 flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-2" />
                Project Documents
            </h2>

            {documents?.length > 0 ? (
                <div className="space-y-3">
                    {documents.map((document) => (
                        <div key={document.id} className="bg-base-200 rounded-lg overflow-hidden shadow-md">
                            {/* Document header - always visible */}
                            <div
                                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-base-300 ${expandedDocId === document.id ? 'bg-base-300' : ''}`}
                                onClick={() => toggleDocument(document.id, document)}
                            >
                                <div className="flex items-center space-x-4">
                                    {getDocumentIcon(document.documentUrl, document.documentType)}
                                    <div>
                                        <h3 className="font-medium text-base">{formatDocumentType(document.documentType)}</h3>
                                        <p className="text-sm text-base-content opacity-70">
                                            {formatFileName(document.documentDescription)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="bg-base-100 text-xs px-2 py-1 rounded-full">
                                        {getFileExtension(document.documentUrl).toUpperCase()}
                                    </span>
                                    {expandedDocId === document.id ? (
                                        <ChevronUpIcon className="w-5 h-5" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5" />
                                    )}
                                </div>
                            </div>

                            {/* Document preview - shown when expanded */}
                            {expandedDocId === document.id && (
                                <div className="border-t border-base-300">
                                    <div className="bg-base-100 p-1">
                                        <div className="flex justify-between items-center bg-base-300 px-3 py-1.5 rounded-t-md">
                                            <span className="text-sm font-medium">Document Preview</span>
                                            <div className="flex items-center space-x-2">
                                                <a
                                                    href={document.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-xs bg-base-100 hover:bg-base-200"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                                    Open
                                                </a>
                                                <button
                                                    className="btn btn-xs btn-ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedDocId(null);
                                                    }}
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-1 bg-white rounded-b-md">
                                            {renderPreview(document)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <DocumentIcon className="w-16 h-16 text-gray-400 mb-3" />
                    <p className="text-gray-500 text-lg">No documents available for this project</p>
                </div>
            )}

            {/* Add custom styles for Excel tables */}
            <style jsx>{`
                .excel-content table {
                    border-collapse: collapse;
                    width: 100%;
                }
                .excel-content th, .excel-content td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                .excel-content tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                .excel-content th {
                    padding-top: 12px;
                    padding-bottom: 12px;
                    background-color: #f8f8f8;
                    color: #333;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
            `}</style>
        </div>
    );
};

export default ProjectDetailsDocumentEvaluation;