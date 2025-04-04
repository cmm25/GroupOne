import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TokenService } from './token.service';
import { MintTokenDto } from './dto/mint-token.dto';
import { DelegateVoteDto } from './dto/delegate-vote.dto';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('mint')
  async mintTokens(@Body() mintTokenDto: MintTokenDto) {
    return this.tokenService.mintTokens(
      mintTokenDto.address,
      mintTokenDto.amount,
    );
  }

  @Get('contract-address')
  getContractAddress() {
    return this.tokenService.getContractAddress();
  }

  @Get('recent-votes')
  getRecentVotes() {
    return this.tokenService.getRecentVotes();
  }

  @Get('voting-power/:address')
  getVotingPower(@Param('address') address: string) {
    return this.tokenService.getVotingPower(address);
  }

  @Get('proposals')
  getProposals() {
    return this.tokenService.getProposals();
  }

  @Get('winning-proposal')
  getWinningProposal() {
    return this.tokenService.getWinningProposal();
  }

  @Post('delegate')
  delegateVotes(@Body() delegateVoteDto: DelegateVoteDto) {
    return this.tokenService.delegateVotes(
      delegateVoteDto.from,
      delegateVoteDto.to,
    );
  }
}
