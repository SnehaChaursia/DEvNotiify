import { Box, Container, Typography, Grid, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SecurityIcon from '@mui/icons-material/Security';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const AboutPage = () => {
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const stats = [
    { icon: <EventIcon sx={{ fontSize: 40 }} />, value: "500+", label: "Hackathons Tracked" },
    { icon: <CodeIcon sx={{ fontSize: 40 }} />, value: "1000+", label: "Contests Monitored" },
    { icon: <PeopleIcon sx={{ fontSize: 40 }} />, value: "10K+", label: "Active Users" },
    { icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />, value: "50+", label: "Success Stories" }
  ];

  const features = [
    {
      icon: <EventIcon sx={{ fontSize: 32 }} />,
      title: "Comprehensive Tracking",
      description: "Stay updated with hackathons and coding competitions from around the world."
    },
    {
      icon: <NotificationsIcon sx={{ fontSize: 32 }} />,
      title: "Smart Notifications",
      description: "Get timely reminders and updates about events you're interested in."
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
      title: "Secure Platform",
      description: "Your data is protected with industry-standard security measures."
    }
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}
        >
          <MotionBox variants={itemVariants}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              About DevNotify
            </Typography>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                maxWidth: '800px',
                mx: 'auto',
                mb: 4,
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              We're on a mission to help developers never miss out on coding opportunities.
              DevNotify is your one-stop platform for tracking hackathons and coding contests.
            </Typography>
          </MotionBox>
        </MotionBox>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: { xs: 6, md: 10 } }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <MotionPaper
                variants={itemVariants}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <MotionPaper
                variants={itemVariants}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    bgcolor: 'rgba(79, 70, 229, 0.02)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>

        {/* Mission Statement */}
        <MotionBox
          variants={itemVariants}
          sx={{
            mt: { xs: 8, md: 12 },
            p: { xs: 4, md: 6 },
            bgcolor: 'primary.main',
            borderRadius: 4,
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
              zIndex: 0
            }
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              position: 'relative',
              zIndex: 1
            }}
          >
            Our Mission
          </Typography>
          <Typography
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              position: 'relative',
              zIndex: 1,
              opacity: 0.9
            }}
          >
            We believe that every developer deserves the opportunity to showcase their skills and grow their career.
            DevNotify is committed to making it easier for developers to discover and participate in coding events,
            helping them build their portfolio and connect with the tech community.
          </Typography>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default AboutPage;
