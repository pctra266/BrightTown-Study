import React from 'react';
import { Box, Container } from '@mui/material';
import { useThemeMode } from '../../../contexts/ThemeContext';

interface StackOverflowLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    sidebar?: React.ReactNode;
}

const StackOverflowLayout: React.FC<StackOverflowLayoutProps> = ({
    children,
    header,
    sidebar
}) => {
    const { actualTheme } = useThemeMode();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: actualTheme === 'dark' ? '#0d1117' : '#f8f9fa',
                color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328'
            }}
        >
            {/* Header */}
            {header && (
                <Box
                    sx={{
                        backgroundColor: actualTheme === 'dark' ? '#161b22' : '#ffffff',
                        borderBottom: `1px solid ${actualTheme === 'dark' ? '#30363d' : '#d1d9e0'}`,
                        position: 'sticky',
                        top: 0,
                        zIndex: 100
                    }}
                >
                    <Container maxWidth="xl">
                        {header}
                    </Container>
                </Box>
            )}

            {/* Main Content Area */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* Sidebar */}
                    {sidebar && (
                        <Box
                            sx={{
                                width: 300,
                                minWidth: 300,
                                display: { xs: 'none', lg: 'block' },
                                position: 'sticky',
                                top: 80,
                                height: 'fit-content',
                                maxHeight: 'calc(100vh - 100px)',
                                overflowY: 'auto'
                            }}
                        >
                            {sidebar}
                        </Box>
                    )}

                    {/* Main Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {children}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default StackOverflowLayout;