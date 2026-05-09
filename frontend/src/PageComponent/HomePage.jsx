import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../NavbarComponent/Footer";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Dialog,
  DialogContent,
  IconButton,
  Slide,
} from "@mui/material";
import smart_exam from "../images/smart_exam.png";
import monitoring from "../images/monitoring.png";
import descriptive from "../images/descriptive.png";
import mock from "../images/mock.png";
import chart from "../images/chart.png";
import bot from "../images/bot.png";
import smart_exam_app from "../images/smart_exam_app.apk";
// Icons 
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import CloseIcon from '@mui/icons-material/Close';
import AndroidIcon from '@mui/icons-material/Android';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const HomePage = () => {
  const theme = useTheme();

  const [openAppModal, setOpenAppModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const hasShownModal = localStorage.getItem("appModalShown");
    if (!hasShownModal) {
      const timer = setTimeout(() => {
        setOpenAppModal(true);
        localStorage.setItem("appModalShown", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseModal = () => {
    setOpenAppModal(false);
  };

  const handleDownloadApp = () => {
    // Placeholder for actual download link
    const link = document.createElement('a');
    link.href = smart_exam_app;
    link.download = 'SmartExamApp.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setOpenAppModal(false);
  };

  const sessionData = [
    { id: 1, class: "Grade 1 (Beginners)", time: "17:00 to 18:00", days: "MON, WED, SAT" },
    { id: 2, class: "Grade 2 (Intermediate)", time: "18:00 to 19:00", days: "MON, THUR, SAT" },
    { id: 3, class: "Grade 3 (Professionals)", time: "19:00 to 20:00", days: "WED, THUR, SAT" },
  ];

  const features = [
    {
      title: "AI Proctoring",
      description: "Advanced continuous monitoring ensures exam integrity and securely tracks tab switching or unusual activity.",
      icon: <SecurityIcon fontSize="large" color="primary" />,
      alt: "AI powered exam monitoring system illustration",
      image: monitoring
    },
    {
      title: "Automated Evaluation",
      description: "Instant AI-driven assessment for both objective and descriptive answers drastically cuts grading time.",
      icon: <PsychologyIcon fontSize="large" color="primary" />,
      alt: "AI evaluation of descriptive answers",
      image: descriptive
    },
    {
      title: "Mock Exams",
      description: "Practice makes perfect. Simulate real exam conditions to build confidence and refine your strategy.",
      icon: <TrackChangesIcon fontSize="large" color="primary" />,
      alt: "online mock test dashboard",
      image: mock
    },
    {
      title: "Topic-wise Testing",
      description: "Target specific areas of weakness with customized quizzes generated dynamically.",
      icon: <DashboardCustomizeIcon fontSize="large" color="primary" />,
      alt: "students taking computer based exam",
      image: mock
    },
    {
      title: "Performance Analytics",
      description: "Visualize your growth over time with deep insights and statistical breakdowns.",
      icon: <AssessmentIcon fontSize="large" color="primary" />,
      alt: "student performance analytics chart",
      image: chart
    },
    {
      title: "Secure Environment",
      description: "Bank-grade encryption safeguards student data and institutional intellectual property.",
      icon: <InsightsIcon fontSize="large" color="primary" />,
      alt: "online exam dashboard interface",
      image: smart_exam
    }
  ];


  return (
    <Box sx={{ backgroundColor: "#f8f9fc", minHeight: "100vh", overflowX: "hidden" }}>

      {/* 1. Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          color: "white",
          pt: { xs: 8, md: 14 },
          pb: { xs: 8, md: 14 },
          boxShadow: theme.shadows[4]
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}>
                AI-Powered <br />
                <span style={{ color: "#4facfe" }}>Smart Exam Platform</span>
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
                Unlock your full potential with automated, secure exams, cheating detection, and intelligent evaluation algorithms designed for the future of education.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/user/login"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: '#1e3c72',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    borderRadius: '30px',
                    '&:hover': { bgcolor: '#f0f0f0' }
                  }}
                >
                  Start Exam
                </Button>
                <Button
                  component={Link}
                  to="/user/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: '30px',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Explore Mock Tests
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '250px', md: '400px' },
                  borderRadius: '24px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  src={smart_exam}
                  component="img"
                  alt="AI powered online examination illustration"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 2. Features Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="h3" align="center" fontWeight={700} color="text.primary" gutterBottom>
          Our <span style={{ color: "#2a5298" }}>Intelligent</span> Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: "700px", mx: "auto" }}>
          Built with cutting-edge technology to ensure comprehensive syllabus coverage, precise testing, and robust analytics.
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                    borderColor: 'transparent'
                  }
                }}
              >
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{
                    bgcolor: 'rgba(42, 82, 152, 0.1)',
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '16px',
                    mb: 3
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" fontWeight={700} mb={2} color="text.primary">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, flexGrow: 1 }}>
                    {feature.description}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: '140px',
                      bgcolor: '#f0f4f8',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      component="img"
                      src={feature.image}
                      alt={feature.alt}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 3. Session Schedule & Mock Exams Section */}
      <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 10 }, borderTop: '1px solid #eaebf0', borderBottom: '1px solid #eaebf0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="stretch">
            {/* Session Schedule */}
            <Grid item xs={12} lg={7}>
              <Box mb={4}>
                <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                  Session Schedule
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Join our dedicated live sessions tailored for all grade levels.
                </Typography>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #eaebf0', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 500 }} aria-label="schedule table">
                  <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Class Grade</TableCell>
                      <TableCell align="left" sx={{ fontWeight: 700, color: '#333' }}>Time Slot</TableCell>
                      <TableCell align="left" sx={{ fontWeight: 700, color: '#333' }}>Active Days</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessionData.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#fbfbfd' } }}
                      >
                        <TableCell component="th" scope="row" sx={{ py: 2.5, fontWeight: 600, color: '#1e3c72' }}>
                          {row.class}
                        </TableCell>
                        <TableCell align="left" sx={{ py: 2.5, color: '#555' }}>{row.time}</TableCell>
                        <TableCell align="left" sx={{ py: 2.5, color: '#555' }}>{row.days}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  width: '100%',
                  height: '120px',
                  mt: 4,
                  bgcolor: '#f8f9fc',
                  borderRadius: '16px',
                  border: '1px dashed #d0d7e2',
                  overflow: 'hidden'
                }}
              >
                <Box
                  component="img"
                  src={mock}
                  alt="online class schedule dashboard illustration"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>

            {/* Mock Exams Highlight */}
            <Grid item xs={12} lg={5}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 40px rgba(79, 172, 254, 0.3)'
                }}
              >
                <CardContent sx={{ p: { xs: 4, md: 5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
                    Mock Exams
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 4 }}>
                    Start preparing with our highly accurate mock exams designed to match the exact pattern and difficulty of your finals.
                  </Typography>

                  <Box
                    sx={{
                      width: '100%',
                      height: '180px',
                      mb: 4,
                      bgcolor: 'rgba(0,0,0,0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      component="img"
                      src={mock}
                      alt="student taking online mock exam on laptop"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    />
                  </Box>

                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      component={Link}
                      to="/user/login"
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: 'white',
                        color: '#0083B0',
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: '16px',
                        '&:hover': { bgcolor: '#f8f9fa' }
                      }}
                    >
                      Get Started Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. Promotional Banner Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            bgcolor: '#1a2942',
            borderRadius: '32px',
            overflow: 'hidden',
            position: 'relative',
            px: { xs: 3, md: 8 },
            py: { xs: 6, md: 10 },
            textAlign: 'center',
            boxShadow: theme.shadows[10]
          }}
        >
          {/* Abstract background shapes */}
          <Box sx={{ position: 'absolute', top: '-50%', left: '-20%', width: { xs: '300px', md: '500px' }, height: { xs: '300px', md: '500px' }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,172,254,0.15) 0%, rgba(0,0,0,0) 70%)' }} />
          <Box sx={{ position: 'absolute', bottom: '-50%', right: '-20%', width: { xs: '300px', md: '500px' }, height: { xs: '300px', md: '500px' }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(132,94,194,0.15) 0%, rgba(0,0,0,0) 70%)' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight={800} color="white" gutterBottom sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
              Simplify and Upgrade Your Skills
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 6, maxWidth: '600px', mx: 'auto', fontWeight: 400 }}>
              Join thousands of students leveraging AI to improve their knowledge, test-taking strategies, and overall educational journey.
            </Typography>

            <Box
              sx={{
                width: '100%',
                maxWidth: '700px',
                height: { xs: '200px', md: '250px' },
                mx: 'auto',
                mb: 6,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src={bot}
                alt="AI assisted learning platform illustration"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              />
            </Box>

            <Button
              component={Link}
              to="/user/login"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#4facfe',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '30px',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(79,172,254,0.4)',
                '&:hover': { bgcolor: '#00f2fe' }
              }}
            >
              Start Your Journey
            </Button>
          </Box>
        </Box>
      </Container>

      <Dialog
        open={openAppModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseModal}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            padding: theme.spacing(1),
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            maxWidth: '360px',
            width: '95%',
            margin: '16px',
            position: 'relative',
            overflow: 'visible'
          }
        }}
      >
        <IconButton
          aria-label="close"
          onClick={handleCloseModal}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: theme.palette.grey[500],
            backgroundColor: 'rgba(0,0,0,0.05)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.1)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2, px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              boxShadow: '0 8px 16px rgba(76, 175, 80, 0.2)'
            }}
          >
            <AndroidIcon sx={{ fontSize: 48, color: '#4caf50' }} />
          </Box>
          <Typography variant="h5" component="h2" fontWeight={800} gutterBottom sx={{ color: '#1e3c72' }}>
            Get Our Android App 🚀
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Download our Android app for a faster and better experience.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleDownloadApp}
              sx={{
                bgcolor: '#4facfe',
                color: 'white',
                py: 1.5,
                fontWeight: 700,
                borderRadius: '30px',
                boxShadow: '0 8px 20px rgba(79,172,254,0.4)',
                '&:hover': { bgcolor: '#00f2fe' }
              }}
            >
              Download Now
            </Button>
            <Button
              variant="text"
              onClick={handleCloseModal}
              sx={{
                color: '#757575',
                fontWeight: 600,
                '&:hover': { background: 'transparent', color: '#424242' }
              }}
            >
              Maybe Later
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Footer remains original layout */}
      <Footer />
    </Box>
  );
};

export default HomePage;
