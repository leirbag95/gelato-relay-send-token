// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {
    ERC20Permit
} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC2771Context } from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract PermitProxy is ERC2771Context {

    ERC20Permit public token; 

         modifier onlyTrustedForwarder() {
    require(isTrustedForwarder(msg.sender), "Only callable by Trusted Forwarder");
    _;
  }

    constructor(ERC20Permit _token)
        ERC2771Context(address(0xd8253782c45a12053594b9deB72d8e8aB2Fca54c))
    {
        token = _token;
    }


    function makeTradeFake(
        address owner,
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyTrustedForwarder {
       
        //address signer = _getSigner(owner,amount,deadline,v,r,s);

        //require(signer == owner,'NOOO');
        token.permit(owner, address(this), amount , deadline, v, r, s);
        token.transferFrom(owner, to, amount);
    }

}