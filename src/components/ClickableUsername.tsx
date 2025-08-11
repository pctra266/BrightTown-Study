import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip, type ChipProps } from '@mui/material';
import { Person } from '@mui/icons-material';

interface ClickableUsernameProps extends Omit<ChipProps, 'label' | 'component' | 'onClick'> {
  userId: string;
  username: string;
  showIcon?: boolean;
}

const ClickableUsername: React.FC<ClickableUsernameProps> = ({ 
  userId, 
  username, 
  showIcon = true,
  ...chipProps 
}) => {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent parent click events
    navigate(`/user/${userId}`);
  };

  return (
    <Chip
      icon={showIcon ? <Person /> : undefined}
      label={username}
      onClick={handleClick}
      clickable
      sx={{
        '&:hover': {
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          '& .MuiChip-icon': {
            color: 'primary.contrastText',
          },
        },
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        ...chipProps.sx,
      }}
      {...chipProps}
    />
  );
};

export default ClickableUsername;