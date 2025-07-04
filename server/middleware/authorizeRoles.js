
function authorizeRoles(...allowedRoles){
    return (req,res,next) =>{
        if(!req.user || !allowedRoles.includes(req.user.role)){
            return res.status(401).json({
                message:`Access denied:${allowedRoles.join(', ')} only`,
            });
        }
        next();
    };
}

module.exports =authorizeRoles;