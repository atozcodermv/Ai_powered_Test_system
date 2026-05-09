import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";

// Icons 
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import CalculateIcon from '@mui/icons-material/Calculate';
import InsightsIcon from '@mui/icons-material/Insights';
import GradeIcon from '@mui/icons-material/Grade';
import TuneIcon from '@mui/icons-material/Tune';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import PeopleIcon from '@mui/icons-material/People';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AboutUs = () => {
  const theme = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const gradingSystem = [
    {
      grade: "Grade 1 - Beginners",
      description: "Step-by-step foundational concepts for those just starting out.",
      icon: <GradeIcon color="primary" fontSize="large" />,
      alt: "beginner level online learning illustration"
    },
    {
      grade: "Grade 2 - Intermediate",
      description: "Challenging intermediate topics bridging basics to advanced techniques.",
      icon: <ArchitectureIcon color="primary" fontSize="large" />,
      alt: "intermediate coding student illustration"
    },
    {
      grade: "Grade 3 - Professionals",
      description: "Advanced, industry-level practices tailored for mastery.",
      icon: <SchoolIcon color="primary" fontSize="large" />,
      alt: "professional developer learning illustration"
    }
  ];

  const courses = [
    {
      title: "Software Engineering",
      icon: <CodeIcon color="primary" />,
      alt: "software engineering coding illustration",
      levels: [
        { grade: "Grade 1 (Beginners)", desc: "Introduction to Software Engineering Concepts" },
        { grade: "Grade 2 (Intermediate)", desc: "Software Development Fundamentals" },
        { grade: "Grade 3 (Professionals)", desc: "Advanced Software Engineering Practices" }
      ]
    },
    {
      title: "Mathematics",
      icon: <CalculateIcon color="primary" />,
      alt: "mathematics learning dashboard illustration",
      levels: [
        { grade: "Grade 1 (Beginners)", desc: "Foundations of Mathematics" },
        { grade: "Grade 2 (Intermediate)", desc: "Intermediate Mathematics Concepts" },
        { grade: "Grade 3 (Professionals)", desc: "Advanced Mathematics and Applications" }
      ]
    },
    {
      title: "Machine Learning",
      icon: <InsightsIcon color="primary" />,
      alt: "machine learning AI model visualization illustration",
      levels: [
        { grade: "Grade 1 (Beginners)", desc: "Introduction to Machine Learning Basics" },
        { grade: "Grade 2 (Intermediate)", desc: "Applied Machine Learning Techniques" },
        { grade: "Grade 3 (Professionals)", desc: "Advanced Machine Learning and Deep Learning" }
      ]
    }
  ];

  const advantages = [
    {
      title: "Personalized Grading",
      description: "Tailored courses for different proficiency levels.",
      icon: <TuneIcon fontSize="large" color="primary" />,
      alt: "AI personalized grading illustration"
    },
    {
      title: "Flexible Learning Paths",
      description: "Choose courses based on your grade and interest.",
      icon: <AutoAwesomeIcon fontSize="large" color="primary" />,
      alt: "AI flexible learning paths illustration"
    },
    {
      title: "Expert Instructors",
      description: "Learn from industry professionals and experienced educators.",
      icon: <PeopleIcon fontSize="large" color="primary" />,
      alt: "AI expert instructors illustration"
    }
  ];

  return (
    <Box sx={{ backgroundColor: "#fdfdfd", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* 1. Hero Section */}
      <Box 
        sx={{ 
          background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)", 
          pt: { xs: 8, md: 12 }, 
          pb: { xs: 8, md: 12 },
          borderBottom: '1px solid #c8d3e0'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" fontWeight={800} color="#102a43" gutterBottom sx={{ fontSize: { xs: "2.2rem", md: "3rem" } }}>
                About Smart Exam <br />
                <span style={{ color: "#2a5298" }}>AI Powered Examination Platform</span>
              </Typography>
              <Typography variant="h6" sx={{ color: "#486581", mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
                Welcome to our esteemed coaching platform, where we specialize in providing top-notch education in software engineering, mathematics, and machine learning across different proficiency levels. Embark on a journey of knowledge and skill development with us!
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: { xs: '250px', md: '350px' }, 
                  borderRadius: '24px', 
                  backgroundColor: 'white',
                  boxShadow: '0 10px 30px rgba(16,42,67,0.1)',
                  overflow: 'hidden',
                  border: '1px solid #bcccdc'
                }}
              >
                <Box
                  component="img"
                  src="https://placehold.co/600x350/eaebf0/2a5298?text=EdTech+Learning+Platform"
                  alt="AI powered online examination platform illustration"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 2. Mission Section */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        <Card 
          elevation={0} 
          sx={{ 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            boxShadow: theme.shadows[6]
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: '50%', mb: 2 }}>
              <SchoolIcon sx={{ fontSize: 40, color: '#4facfe' }} />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 300, fontStyle: 'italic', opacity: 0.9 }}>
              "Nurturing Excellence, Building Futures"
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* 3. Grading System */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Typography variant="h3" align="center" fontWeight={700} color="text.primary" gutterBottom>
          Grading System
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: "700px", mx: "auto" }}>
          Structured learning paths designed to take you from foundational basics to industry mastery.
        </Typography>

        <Grid container spacing={4}>
          {gradingSystem.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex', flexDirection: 'column'
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Box sx={{ bgcolor: '#f0f4f8', p: 1.5, borderRadius: '12px' }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {item.grade}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={`https://placehold.co/400x140/f8f9fc/1e3c72?text=Grade+Level+${index + 1}`}
                      alt={item.alt}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 4. Courses Offered */}
      <Box sx={{ bgcolor: '#f4f6f8', py: { xs: 8, md: 10 }, borderTop: '1px solid #eaebf0' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" fontWeight={700} color="text.primary" gutterBottom>
            Courses Offered
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: "700px", mx: "auto" }}>
            Explore our specialized curriculum deeply rooted in modern technology and computational logic.
          </Typography>

          <Grid container spacing={4}>
            {courses.map((course, idx) => (
              <Grid item xs={12} lg={4} key={idx}>
                <Accordion 
                  defaultExpanded={idx === 0}
                  elevation={0}
                  sx={{ 
                    borderRadius: '16px !important', 
                    mb: 2, 
                    border: '1px solid rgba(0,0,0,0.05)',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {course.icon}
                      <Typography variant="h6" fontWeight={700}>
                        {course.title}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3, pt: 0 }}>
                    <Box sx={{ width: '100%', height: '100px', mb: 2, borderRadius: '8px', overflow: 'hidden' }}>
                      <Box
                        component="img"
                        src={`https://placehold.co/400x100/eaebf0/2a5298?text=${course.title.replace(' ', '+')}`}
                        alt={course.alt}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <List disablePadding>
                      {course.levels.map((lvl, lIdx) => (
                        <ListItem key={lIdx} sx={{ px: 0, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4facfe' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2" fontWeight={700}>{lvl.grade}</Typography>}
                            secondary={lvl.desc}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. What Sets Us Apart */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'relative' }}>
              <Typography variant="h3" fontWeight={700} color="text.primary" gutterBottom>
                What Sets Us Apart
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                We combine artificial intelligence with elite educational methodologies to create an unparalleled learning experience.
              </Typography>
              <Box sx={{ width: '100%', height: '280px', borderRadius: '24px', overflow: 'hidden', boxShadow: theme.shadows[4] }}>
                <Box
                  component="img"
                  src="https://placehold.co/500x300/1e3c72/ffffff?text=AI+Personalized+Learning"
                  alt="AI personalized learning system illustration"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container spacing={3}>
              {advantages.map((adv, index) => (
                <Grid item xs={12} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #eaebf0', borderRadius: '16px', '&:hover': { bgcolor: '#f8f9fc' } }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3 }}>
                      <Box sx={{ bgcolor: 'rgba(42, 82, 152, 0.1)', p: 2, borderRadius: '16px' }}>
                        {adv.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {adv.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
                          {adv.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* 6. Promotional Banner Section CTA */}
      <Box sx={{ py: { xs: 6, md: 8 }, px: 2 }}>
        <Container maxWidth="md">
          <Box 
            sx={{ 
              bgcolor: '#1a2942', 
              borderRadius: '32px', 
              overflow: 'hidden',
              position: 'relative',
              px: { xs: 3, md: 8 },
              py: { xs: 6, md: 8 },
              textAlign: 'center',
              boxShadow: theme.shadows[10]
            }}
          >
            {/* Abstract background shapes */}
            <Box sx={{ position: 'absolute', top: '-50%', left: '-20%', width: {xs: '300px', md: '500px'}, height: {xs: '300px', md: '500px'}, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,172,254,0.15) 0%, rgba(0,0,0,0) 70%)' }} />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight={800} color="white" gutterBottom sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
                Start Your Smart Learning Journey Today
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, fontWeight: 400 }}>
                Experience the intersection of artificial intelligence and professional education.
              </Typography>

              <Box 
                sx={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: '150px', 
                  mx: 'auto',
                  mb: 5,
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  component="img"
                  src="https://placehold.co/500x150/1a2942/4facfe?text=Start+Your+Journey+Now"
                  alt="students preparing for AI powered online exams illustration"
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
                  py: 1.5, 
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  borderRadius: '30px',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(79,172,254,0.4)',
                  '&:hover': { bgcolor: '#00f2fe' } 
                }}
              >
                Explore Exams
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default AboutUs;
