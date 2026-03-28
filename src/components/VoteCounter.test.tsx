import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoteCounter from './VoteCounter';

const defaultProps = {
  projectId: 'proj-1',
  voteCount: 5,
  onVote: vi.fn().mockResolvedValue(true),
  remainingVotes: 3,
};

// Helper to get the up-vote and down-vote buttons
// VoteCounter renders: [0] up button, [1] down button
const getUpBtn = () => screen.getAllByRole('button')[0];
const getDownBtn = () => screen.getAllByRole('button')[1];

describe('VoteCounter', () => {
  it('renders the current vote count', () => {
    render(<VoteCounter {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows remaining votes in the label', () => {
    render(<VoteCounter {...defaultProps} remainingVotes={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onVote(true) when up button is clicked', async () => {
    const onVote = vi.fn().mockResolvedValue(true);
    render(<VoteCounter {...defaultProps} onVote={onVote} />);
    await userEvent.click(getUpBtn());
    expect(onVote).toHaveBeenCalledWith(true);
  });

  it('calls onVote(false) when down button is clicked', async () => {
    const onVote = vi.fn().mockResolvedValue(true);
    render(<VoteCounter {...defaultProps} onVote={onVote} voteCount={2} />);
    await userEvent.click(getDownBtn());
    expect(onVote).toHaveBeenCalledWith(false);
  });

  it('disables up button when remainingVotes=0 and voteCount=0', () => {
    render(<VoteCounter {...defaultProps} remainingVotes={0} voteCount={0} />);
    expect(getUpBtn()).toBeDisabled();
  });

  it('up button is NOT disabled when voteCount>0 even with 0 remaining votes', () => {
    // User has existing votes — they can still adjust
    render(<VoteCounter {...defaultProps} remainingVotes={0} voteCount={2} />);
    expect(getUpBtn()).not.toBeDisabled();
  });

  it('down button is disabled when voteCount=0', () => {
    render(<VoteCounter {...defaultProps} voteCount={0} />);
    expect(getDownBtn()).toBeDisabled();
  });

  it('down button is NOT disabled when voteCount>0', () => {
    render(<VoteCounter {...defaultProps} voteCount={1} />);
    expect(getDownBtn()).not.toBeDisabled();
  });

  it('shows "Demo" label when isDemo=true', () => {
    render(<VoteCounter {...defaultProps} isDemo={true} remainingVotes={0} />);
    expect(screen.getByText('Demo')).toBeInTheDocument();
  });

  it('up button is enabled for demo project even with 0 remaining votes and 0 count', () => {
    render(<VoteCounter {...defaultProps} isDemo={true} remainingVotes={0} voteCount={0} />);
    expect(getUpBtn()).not.toBeDisabled();
  });
});
