#!/bin/bash
#
# Print banner art.

#######################################
# Print a board. 
# Globals:
#   BG_BROWN
#   NC
#   WHITE
#   CYAN_LIGHT
#   RED
#   GREEN
#   YELLOW
# Arguments:
#   None
#######################################
print_banner() {

  clear

  printf "\n\n"

printf "${YELLOW}";

printf ${YELLOW}"                  SISTEMA PARA MULTIPLOS ATENDIMENTOS WHATSAPP \n" 
printf ${GREEN}" ███████╗  █████╗  ██████╗  ███████╗ ███████╗ ██╗     ██╗     ███████╗ ██████╗  \n" 
printf ${GREEN}" ╚══███╔╝ ██╔══██╗ ██╔══██╗ ██╔════╝ ██╔════╝ ██║     ██║     ██╔════╝ ██╔══██╗ \n"
printf ${GREEN}"   ███╔╝  ███████║ ██████╔╝ ███████╗ █████╗   ██║     ██║     █████╗   ██████╔╝ \n"
printf ${GREEN}"  ███╔╝   ██╔══██║ ██╔═══╝  ╚════██║ ██╔══╝   ██║     ██║     ██╔══╝   ██╔══██╗ \n" 
printf ${GREEN}" ███████╗ ██║  ██║ ██║      ███████║ ███████╗ ███████╗███████╗███████╗ ██║  ██║ \n"
printf ${GREEN}" ╚══════╝ ╚═╝  ╚═╝ ╚═╝      ╚══════╝ ╚══════╝ ╚══════╝╚══════╝╚══════╝ ╚═╝  ╚═╝ \n"  
printf "\n" 
                                                                                                                                                         
printf "            \033[1;33m        ";
printf "${NC}";

printf "\n"
}
