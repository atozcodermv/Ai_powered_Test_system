import React, { useRef, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';

// Icons 
import SpeedIcon from '@mui/icons-material/Speed';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';

const ContactUs = () => {
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const form = useRef();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_nfpgg6g', 'template_lvu2iwh', form.current, 'iDwvUQnW8W3704oM6')
      .then((result) => {
        console.log(result.text);
      }, (error) => {
        console.log(error.text);
      });

    setSubmitted(true);
    // Optional: Reset form fields after submission
    if(form.current) {
        form.current.reset();
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSubmitted(false);
  };

  const supportFeatures = [
    {
      title: "Quick Response Support",
      description: "Our team prioritizes timely resolutions for your inquiries.",
      icon: <SpeedIcon fontSize="large" color="primary" />,
    },
    {
      title: "Secure Communication",
      description: "All messages are encrypted ensuring your data's privacy.",
      icon: <EnhancedEncryptionIcon fontSize="large" color="primary" />,
    },
    {
      title: "AI Assisted Help",
      description: "Intelligent triage algorithms instantly categorize your requests.",
      icon: <SmartToyIcon fontSize="large" color="primary" />,
    }
  ];

  return (
    <Box sx={{ backgroundColor: "#fdfdfd", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* 1. Hero Header Section */}
      <Box 
        sx={{ 
          background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)", 
          pt: { xs: 8, md: 10 }, 
          pb: { xs: 8, md: 10 },
          borderBottom: '1px solid #c8d3e0'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" fontWeight={800} color="#102a43" gutterBottom sx={{ fontSize: { xs: "2.2rem", md: "3rem" } }}>
                Contact Smart Exam <br />
                <span style={{ color: "#2a5298" }}>AI Powered Examination Support</span>
              </Typography>
              <Typography variant="h6" sx={{ color: "#486581", mb: 2, fontWeight: 400, lineHeight: 1.6 }}>
                We value your feedback, questions, and inquiries. Feel free to reach out through the provided contact form for exam assistance, technical issues, or general feedback.
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
                  src="https://placehold.co/600x350/eaebf0/2a5298?text=Customer+Support"
                  alt="AI powered customer support for online exams illustration"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 2. Main Content Area: Form & Side Visual */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6}>
          {/* Left Side: Form */}
          <Grid item xs={12} md={7}>
            <Card 
              elevation={0} 
              sx={{ 
                p: { xs: 2, sm: 4 }, 
                borderRadius: '24px', 
                boxShadow: theme.shadows[4],
                border: '1px solid #eaebf0'
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                  Send us a Message
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Your satisfaction is our priority, and we look forward to hearing from you.
                </Typography>

                <form ref={form} onSubmit={sendEmail}>
                  <Grid container spacing={3}>
                    {/* Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="user_name"
                        variant="outlined"
                        required
                        InputProps={{
                          startAdornment: (
                            <PersonIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="user_email"
                        type="email"
                        variant="outlined"
                        required
                        InputProps={{
                          startAdornment: (
                            <EmailIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    {/* Contact Number */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Contact Number"
                        name="user_phone"
                        type="tel"
                        variant="outlined"
                        required
                        InputProps={{
                          startAdornment: (
                            <PhoneIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    {/* Message */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={6}
                        variant="outlined"
                        required
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                       <Button 
                        type="submit"
                        variant="contained" 
                        size="large" 
                        fullWidth
                        endIcon={<SendIcon />}
                        sx={{ 
                          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                          color: 'white',
                          py: 1.8, 
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          borderRadius: '12px',
                          textTransform: 'none',
                          boxShadow: '0 8px 16px rgba(42,82,152,0.3)',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-2px)' } 
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side: Visual Section */}
          <Grid item xs={12} md={5}>
            <Box 
              sx={{ 
                height: '100%', 
                minHeight: '400px',
                borderRadius: '24px', 
                backgroundColor: '#f4f6f8',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)',
                border: '1px dashed #ced4da',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                py: {xs: 4, md: 0}
              }}
            >
               <Box
                  component="img"
                  src="https://placehold.co/400x500/f8f9fc/1e3c72?text=Student+Support"
                  alt="student contacting AI powered exam platform support illustration"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>
          </Grid>
        </Grid>
      </Container>


      {/* 3. Support Info Cards */}
      <Box sx={{ bgcolor: '#f4f6f8', py: { xs: 8, md: 10 }, borderTop: '1px solid #eaebf0' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" fontWeight={700} color="text.primary" gutterBottom>
            Always Here to Help
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: "600px", mx: "auto" }}>
            Leveraging cutting edge connectivity to provide a seamless support experience.
          </Typography>

          <Grid container spacing={4}>
            {supportFeatures.map((feature, idx) => (
               <Grid item xs={12} md={4} key={idx}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex', flexDirection: 'column',
                    transition: 'box-shadow 0.3s',
                    '&:hover': { boxShadow: theme.shadows[4] }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ display: 'inline-flex', bgcolor: 'rgba(42,82,152,0.1)', p: 2, borderRadius: '50%', mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Snackbar / Alert for form submission */}
      <Snackbar 
        open={submitted} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', borderRadius: '12px', boxShadow: theme.shadows[6] }}>
          <strong>Message Sent Successfully!</strong> We'll get back to you shortly.
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default ContactUs;


