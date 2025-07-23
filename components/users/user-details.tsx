"use client";

import { useState } from "react";
import { UserData, toggleUserStatus, deleteUser } from "@/lib/actions/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Building2,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserDetailsContentProps {
  user: UserData;
}

export function UserDetailsContent({ user }: UserDetailsContentProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const result = await toggleUserStatus(user.id, !user.is_active);
      if (result.success) {
        toast.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update user status");
      }
    } catch (error) {
      toast.error("An error occurred while updating user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setActionLoading(true);
   ;
}</div>
  )    >
      </div </Card>
      ent>
 Cont  </Card
          </div>
            </p>         ed_at)}
   pdatDate(user.u{format            ">
    reground-muted-foext-sm textName="tlassp c           <>
   ed</p Updatdium">Lastont-mesm f="text-ssNamecla  <p            
 v>        <di          
  </div>
            
    r.id}</p>{usent-mono">reground fot-muted-fotext-sm texme=" classNa     <p         
ID</p>User -medium"> fontext-smssName="t  <p cla        
    <div>      ">
      "space-y-4me=ssNadContent cla       <Carer>
   </CardHead
          dTitle>rmation</Car InfoTitle>System     <Cardr>
       Heade     <Cardd>
     Car <
        */}tionInformaem st Sy       {/*

   )}ard>
               </C>
 rdContent/Ca   <                 )}
iv>
          </d     p>
              </  )
         nue(sunt} ver.venue_coue_ownes {user.venge     Mana               und">
ted-foregromuxt-text-sm tesName="ascl         <p   
              </p>          
 1)}.slice(.roleervenue_own user.pperCase() +.toUAt(0)er.role.charownr.venue_       {use             nd">
oregrout-muted-ftex"text-sm sName=    <p clas            ner</p>
  Venue Owum">sm font-mediame="text-ssNp cla          <       >
        <div     & (
     &venue_ownerer.    {us
                        
 )}         >
        </div             )}
               </div>
                     
 >  </pre                  2)}
  ons, null, missierdmin_role.pr.aingify(use  {JSON.str                    1">
  rounded mt-muted p-2 eground bg-xt-muted-for"text-xs tessName=la      <pre c            </p>
    issionsrmdium">Pem font-me"text-sme=Na    <p class            2">
      "mt-me=classNa    <div            (
     ssions && rmiole.pein_r {user.adm            /p>
        <              se()}
 perCaUptoe('_', ' ').role.replacn_role.  {user.admi           ">
       foreground-muted-ext-sm textssName="t      <p cla         ole</p>
   m">Admin R font-mediume="text-sm <p classNa                   <div>
            && (
   min_roleer.ad       {us
       -y-4">e="spaceNament classCardCont         <r>
   /CardHeade        <    itle>
     </CardT
         nformation      Role I
           )}             -5" />
  Name="h-5 wding2 class   <Buil        
             ) : (           w-5" />
Name="h-5lass  <Shield c             e ? (
   n_rolser.admi       {u         p-2">
ms-center ga"flex ite=sNamele clasdTit  <Car           
 er>ead <CardH            <Card>
        ner) && (
 r.venue_owsen_role || uuser.admi {(*/}
       n e Informatio  {/* Rold>

      /Car>
        <ardContent        </C          )}
div>
        </      
        </p>       
     id}ider_rovauth_p     {user.       o">
      nt-monground foted-fore-sm text-muName="text    <p class           ID</p>
  ovider">Prfont-medium"text-sm sName=  <p clas      
        iv>          <d && (
    rovider_ider.auth_p {us
                      /div>
   <          
    </div>       </p>
                ce(1)}
   r.sliovideuser.auth_prrCase() + oUppe.charAt(0).troviderer.auth_pus     {         nd">
    -foregrouutedext-m t-sm="textclassName      <p     p>
      n</uthenticatio-medium">A fontme="text-smassNa      <p cl           <div>
             />
round" egd-for text-muteme="h-4 w-4ld classNa  <Shie         
   -3">-center gapflex itemsssName="iv cla     <d       
     iv>
              </ddiv>
             </     p>
        </       "}
  ever: "N) inser.last_logate(utDman ? forlast_logir.      {use          round">
  eg-muted-fortext="text-sm className  <p              n</p>
 ast Logiedium">Lt-mtext-sm fonme="Na <p class        v>
       di        <     ound" />
 uted-foregr w-4 text-mssName="h-4k cla  <Cloc       3">
     p-s-center gaex itemame="flsNas   <div cl            
        iv>
  </d     iv>
               </d/p>
            <}
         at)created_e(user.Datormat{f                nd">
  regrouuted-fo-sm text-m"textsName= <p clas               /p>
oined<edium">Jt-msm fon"text-className=    <p             
v>     <di>
         eground" /ted-formu4 w-4 text-ame="h-ndar classN    <Cale     ">
      gap-3enter-c"flex itemsName=ss  <div cla       -4">
   ace-yspe="sNam clastentCon<Card          >
/CardHeader    <
      dTitle>Car        </    rmation
Account Info               />
-5"me="h-5 wNaeld classShi    <      p-2">
    gas-center eme="flex ittle classNam <CardTi       >
    Header   <Card
         <Card>/}
       *ont Informati* Accoun    {/d>

    </Car
        ardContent>     </C   )}
     
         >div     </      /p>
   ofile.bio}<user.preground">{ted-forext-mum t-ssName="text     <p clas        
   io</p> mb-1">Bediumfont-m"text-sm Name=lass      <p c         
      <div>        io && (
 file?.b.pro{user         
           
            )}/div>
          <            </div>
             </p>
           
      (", ")}      .join        n)
        ea(Booler.filt                 try]
     ouncation_c.loe? user.profilion_city,file?.locatro.p      {[user          
    ound">oregrxt-muted-f teme="text-smNa  <p class                ation</p>
medium">Locfont-sm "text-ame=<p classN             >
            <div         
nd" />egrou-formutedext-"h-4 w-4 tme=n classNa<MapPi         >
       ap-3"ems-center g"flex itassName=    <div cl
          ) && (tryounn_ciole?.locatuser.profiity || _clocationofile?.er.pr(us      {          
 
              )}v>
       </di               </div>
         
          </p>         ()}
   leDateStringoLocairth).te.date_of_b.profilser {new Date(u                   eground">
-muted-forsm texttext-e=" <p classNam            h</p>
     of Birtum">Date t-medifon"text-sm lassName=    <p c             div>
           <      
ound" />d-foregr-4 text-mute="h-4 wsNameasalendar cl       <C        gap-3">
 enter lex items-c"f className=div         <  (
   f_birth && ile?.date_oofpr      {user.   
           
    )}        iv>
          </dv>
        /di   <        
     >/pphone}<user.reground">{uted-fo text-m"text-smp className=          <      e</p>
  ium">Phon font-medme="text-smclassNa<p           
        v>   <di       
      " />ndregrouted-fo-4 text-mu-4 wme="hone classNa     <Ph   ">
        ter gap-3tems-cene="flex issNam <div cla             (
 .phone &&{user               
    div>
              </ </div>
             >
   l}</pai.em">{userd-foregroundt-mute-sm texsName="textp clas        <      p>
  >Email</ium"sm font-medt-texssName="      <p cla      
          <div>     >
   ground" /uted-fore-4 text-m-4 wName="h <Mail class             gap-3">
ms-center lex ite"fme= classNadiv        <  
  space-y-4">me="lassNaontent c<CardC          rdHeader>
       </Cale>
      </CardTit   
      ontiic Informa     Bas       
  h-5 w-5" />e="NamUser class         <">
     enter gap-2s-ctemflex ilassName="ardTitle c    <C      
  CardHeader>   <
           <Card>on */}
    atiform/* Basic In  {2">
      id-cols- md:grgap-6ame="grid <div classN

          </Card>t>
  /CardConten   <v>
     </di           </div>
       tton>
        </Bu            Delete
             >
  /-2 h-4 w-4"Name="mrsscla    <Trash2          
           >ng}
      ctionLoadiled={aisab      d        User}
  handleDeleteick={    onCl            "sm"
   size=       
      e"uctiviant="destr    var      
      Button   <          utton>
 </B                  )}
             </>
                   Activate
                  4" />
4 w-e="mr-2 h-lassNamck c<UserChe                         <>
       (
              ) :             </>
             tivate
      Deac         " />
      r-2 h-4 w-4me="mrX classNa   <Use      
                    <>        ve ? (
 is_acti    {user.               >
 
          Loading}onled={acti     disab
           tus}tagleS={handleTog onClick              "
 ="smsize            t"}
    faul" : "de"outlinee ? .is_activ={usernt    varia           utton
        <B      </Button>
              Edit
                 >
" /h-4 w-4e="mr-2 amssNt cla <Edi         
      ="sm">tline" size="ou variant     <Button       ap-2">
  er gx items-cent"flesName= clas       <div   
             </div>
  
           /div>       <       iv>
         </d
         </Badge>                ()}
erCase.toUppiderh_prov{user.aut                    
"outline">e variant=       <Badg        ge>
         </Bad        
    "}"Inactivee" :  ? "Activer.is_active      {us         >
     condary"}: "se"  ? "defaulter.is_activevariant={us     <Badge             ge>
    </Bad      }
             {role                
ant(role)}>adgeVarioleBariant={getR  <Badge v        ">
         gap-2 mt-2nter items-ce="flexsNamediv clas    <    p>
        </               
 r.email} useername}` :r.profile.us${useme ? `@nale?.userprofi    {user.           ">
   oundoregrted-f-muextassName="t   <p cl          h2>
     </           
   }.email   : user            me}`
     ast_na.ller.profi_name} ${usefirstofile.prer.   ? `${us                 
nameofile?.last_& user.prirst_name &e?.fer.profil      {us        old">
    l font-bt-2x="texmeNa   <h2 class            >
      <div     
     </Avatar>             rFallback>
     </Avata           ials()}
tInit  {ge            lg">
    Name="text-assclFallback   <Avatar            >
  r.email} /{use_url} alt=arfile?.avater.proc={usge sr  <AvatarIma         >
     h-16 w-16"e="assNamtar cl <Ava             -4">
-x spacenteritems-ceName="flex iv class        <d
    ween">tify-bet jusitems-start"flex ame=div classN        <>
  -6"="ptclassNamedContent         <Car  <Card>

     Header */}    {/* User>
  "space-y-6"lassName=  <div curn (
  ret

  UserRole(); getst role =

  con
  }; });",
   "2-digitminute: 
      t",r: "2-digi
      houmeric",nu "ay:
      d"long",onth:      mc",
 meriar: "nu ye
     ", {"en-USString(Dateocaleng).toLateStrin new Date(d   returg => {
  string: string):Strin = (datet formatDate
  cons
  };
rCase();, 2).toUppe.substring(0user.email return    }
   se();
 rCa0]}`.toUppee.last_name[{user.profil_name[0]}$le.firstofipruser.n `${   retur
   name) {e?.last_profiler._name && us.firstprofile?f (user. => {
    i): stringials = (getInitconst   };

  
    }
ry";rn "seconda      retut:
    defaul";
    ineurn "outl      retNER":
   "CLUB OWase   c";
   ondaryn "secretur":
        RATOR "MODE  case    ;
 "default"eturn       rDMIN":
 e "A      castive";
n "destructur     re  ":
 ER ADMIN"SUP  case {
    role)  switch () => {
   e: stringolariant = (radgeVoleBconst getR  

 };";
 rn "USER    retu  }
";
  "CLUB OWNERreturn r) {
      nue_owneer.vef (us    }
    iperCase();
 ' ').toUp'_',e(role.replac_role.dminn user.atur
      rerole) {(user.admin_
    if ing => {(): strtUserRole =  ge const

 };
    }
  lse);ng(faonLoadiActi{
      set  } finally r");
  g usehile deletinurred wAn error occror("toast.er
      h (error) {catc
    }    }");
   er delete usiled torror || "Falt.er(resu toast.erro    else {
        } 
 n/users");admiuper-er.push("/s   rout");
     ysfulleted succesUser deluccess("   toast.ss) {
     ult.succes if (res    
 .id);teUser(usereleait dt = awesul const r    try {
  