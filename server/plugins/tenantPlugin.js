export default function tenantPlugin(schema){

schema.add({
    tenantId:{
        type:"mongoose.Schema.Types.ObjectId",
        ref:"Organization",
        index:true
    }
});

}
