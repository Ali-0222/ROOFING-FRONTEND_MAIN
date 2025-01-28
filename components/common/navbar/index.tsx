import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Link from 'next/link';
import { useEffect, useState } from "react";

const NavbarLogo = () => (
  <svg
    width="40"
    height="40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g mask="url(#a)">
      <path d="M22.74 27.73v-7.6l6.64-3.79v7.6l-6.64 3.79Z" fill="#007FFF"></path>
      <path d="M16.1 23.93v-7.59l6.64 3.8v7.59l-6.65-3.8Z" fill="#39F"></path>
      <path d="m16.1 16.34 6.64-3.8 6.64 3.8-6.64 3.8-6.65-3.8Z" fill="#A5D8FF"></path>
    </g>
    <g mask="url(#b)">
      <path d="M15.14 32v-7.6l6.65-3.8v7.6L15.14 32Z" fill="#007FFF"></path>
      <path d="M8.5 28.2v-7.6l6.64 3.8V32L8.5 28.2Z" fill="#39F"></path>
      <path d="m8.5 20.6 6.64-3.79 6.65 3.8-6.65 3.8-6.64-3.8Z" fill="#A5D8FF"></path>
    </g>
    <g mask="url(#c)">
      <path d="M15.14 23.46v-7.6L29.38 7.8v7.59l-14.24 8.07Z" fill="#007FFF"></path>
      <path d="M8.5 19.66v-7.6l6.64 3.8v7.6l-6.64-3.8Z" fill="#39F"></path>
      <path d="M8.5 12.07 22.74 4l6.64 3.8-14.24 8.06-6.64-3.8Z" fill="#A5D8FF"></path>
    </g>
  </svg>
);

const pages = [''];
const settings = ['Logout'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  useEffect(() => {
    const email = localStorage.getItem('email');

    if (email) {
      const username = email.split('@')[0];
      setUserName(username);
    }
  }, []);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('email'); 
    window.location.href = '/login';
  };

  return (
    <AppBar position="static" sx={{backgroundColor: 'white'}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <NavbarLogo />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: '',
              fontWeight: 700,
              letterSpacing: '0.0075em',
              color: '#007FFF',
              textDecoration: 'none',
            }}
          >
            RoofingAI
          </Typography>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.0075em',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            RoofingAI
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Link key={page} href={page}>
                <Button
                  sx={{ my: 2, color: 'white', display: 'block' }}
                  onClick={handleCloseNavMenu}
                >
                  {page}
                </Button>
              </Link>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>

  
            <Tooltip title="Logout Manu">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User" />
              </IconButton>
              
            </Tooltip>
            <Typography variant="body2" sx={{ fontWeight: 800, marginRight: 2, color: 'black', ml: 2 }}>
            Welcome {userName}
            </Typography>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleLogout}>
                  <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
