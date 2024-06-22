// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
  Modal,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import axios from "axios";

// Styled component for hiding the file input while keeping it functional
const Input = styled("input")(({ theme }) => ({
  display: "none",
}));

function CareVault() {
  // State hooks for managing file operations and UI states
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [viewingFile, setViewingFile] = useState(null);

  // Redux hooks for dispatching actions and selecting parts of the state
  const dispatch = useDispatch();
  const files = useSelector((state) => state.careVault.files);
  const theme = useTheme();
  const is_admin = useSelector((state) => state.user.is_admin);

  // Handles file selection, filtering out unsupported file types
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type.startsWith("audio/") ||
        selectedFile.type.startsWith("video/")
      ) {
        setFileError("Audio and video files are not allowed.");
        setFile(null);
        setFilename("");
      } else {
        setFile(selectedFile);
        setFilename(selectedFile.name);
        setFileError("");
      }
    }
  };

  // Handles file upload, dispatching a Redux action with the file data
  const handleUpload = () => {
    if (file) {
      dispatch({ type: "UPLOAD_FILES", payload: { file, lovedOneId: 1 } });
      setFile(null);
      setFilename("");
      setFileError("");
    }
  };

  // Fetches the URL for viewing a file and updates state accordingly
  const handleViewFile = async (fileId) => {
    try {
      const response = await axios.get(`/api/care-vault/view/${fileId}`);
      setFileUrl(response.data.url);
      setViewingFile(files.find((f) => f.id === fileId));
    } catch (error) {
      console.error("Error fetching file URL:", error);
    }
  };

  // Resets the file viewing state
  const handleCloseViewer = () => {
    setViewingFile(null);
    setFileUrl("");
  };

  // Handles file deletion with user confirmation
  const handleDeleteFile = (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      dispatch({ type: "DELETE_FILES", payload: { id: fileId } });
    }
  };

  // Placeholder for file download functionality
  const handleDownload = (id, fileName) => {
    dispatch({ type: "DOWNLOAD_FILES", payload: { id, fileName } });
  };

  // Fetches files on component mount
  useEffect(() => {
    dispatch({ type: "FETCH_FILES" });
  }, [dispatch]);

  // UI rendering
  return (
    <Container>
      {/* File selection and upload UI */}
      <label htmlFor="contained-button-file">
        <Input
          id="contained-button-file"
          multiple
          type="file"
          onChange={handleFileChange}
        />
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadFileIcon />}
          style={{ backgroundColor: theme.palette.primary.main }}
        >
          <Typography variant="h6">Choose File...</Typography>
        </Button>
      </label>
      {fileError && <Typography color="error">{fileError}</Typography>}
      {filename && (
        <Typography variant="subtitle1" style={{ marginTop: theme.spacing(2) }}>
          {filename}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        disabled={!file}
        onClick={handleUpload}
        style={{ marginTop: theme.spacing(2) }}
      >
        <Typography variant="h2">Upload</Typography>
      </Button>

      {/* Files list and actions UI */}
      <TableContainer component={Paper} style={{ marginTop: theme.spacing(2) }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ border: "1px solid black" }}>
                File Name
              </TableCell>
              <TableCell align="right" style={{ border: "1px solid black" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell
                  component="td"
                  scope="row"
                  style={{
                    width: "40%",
                    maxWidth: "200px",
                    border: "1px solid black",
                  }}
                >
                  {file.document_name}
                </TableCell>
                <TableCell align="right" style={{ border: "1px solid black" }}>
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewFile(file.id)}
                    color="primary"
                    variant="contained"
                    size="small"
                  >
                    View
                  </Button>
                  <Button
                    startIcon={<DownloadIcon />}
                    color="secondary"
                    variant="contained"
                    size="small"
                  >
                    Download
                  </Button>
                  <Button
                    startIcon={<ShareIcon />}
                    color="tertiary"
                    variant="contained"
                    size="small"
                  >
                    Share
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteFile(file.id)}
                    color="primary"
                    variant="contained"
                    size="small"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* File viewer modal */}
      <Modal
        open={viewingFile !== null}
        onClose={handleCloseViewer}
        aria-labelledby="document-viewer"
        aria-describedby="view-document"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            onClick={handleCloseViewer}
            style={{ position: "absolute", top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" mb={2}>
            {viewingFile?.document_name}
          </Typography>
          {fileUrl ? (
            <iframe
              src={fileUrl}
              style={{
                width: "100%",
                height: "calc(100% - 50px)",
                border: "none",
              }}
              title="Document Viewer"
            />
          ) : (
            <Typography>Loading document...</Typography>
          )}
        </Box>
      </Modal>
    </Container>
  );
}

export default CareVault;